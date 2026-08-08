"use client";

import { useState } from "react";
import { createBpoTask, updateBpoTask, deleteBpoTask } from "@/app/admin/bpo/actions";
import { SyntheticBadge } from "@/components/ui/SyntheticBadge";
import {
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  BPO_STATUSES,
  STATUS_LABEL,
  STATUS_CLASSES,
  isPriorityTask,
} from "@/lib/bpo/constants";

type BpoTask = {
  id: string;
  department: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  is_synthetic?: boolean;
};

type Assignee = { id: string; full_name: string };

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";
const selectClasses = inputClasses;

function TaskForm({
  task,
  assignees,
  onCancel,
  action,
}: {
  task?: BpoTask;
  assignees: Assignee[];
  onCancel: () => void;
  action: (formData: FormData) => Promise<{ success: true } | { error: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="bg-paper-dim border border-ink/10 rounded-sm p-4 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await action(formData);
        setPending(false);
        if ("error" in result) {
          setError(result.error);
        } else {
          onCancel();
        }
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Título</label>
          <input name="title" defaultValue={task?.title} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Departamento</label>
          <select name="department" defaultValue={task?.department ?? DEPARTMENTS[0]} className={selectClasses}>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {DEPARTMENT_LABEL[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Status</label>
          <select name="status" defaultValue={task?.status ?? "pending"} className={selectClasses}>
            {BPO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Vencimento</label>
          <input type="date" name="due_date" defaultValue={task?.due_date ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Responsável</label>
          <select name="assigned_to" defaultValue={task?.assigned_to ?? ""} className={selectClasses}>
            <option value="">Sem responsável</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Descrição</label>
          <textarea name="description" defaultValue={task?.description ?? ""} rows={2} className={inputClasses} />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-700 mb-2">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[11px] uppercase tracking-[0.05em] border border-ink/15 rounded-full px-3.5 py-1.5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export function BpoBoard({
  tasks,
  assigneeNames,
  assignees,
  showCreate,
  onCloseCreate,
  selectedDept,
  onClearSelectedDept,
}: {
  tasks: BpoTask[];
  assigneeNames: Record<string, string>;
  assignees: Assignee[];
  showCreate: boolean;
  onCloseCreate: () => void;
  selectedDept: string | null;
  onClearSelectedDept: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta tarefa? Essa ação não pode ser desfeita.")) return;
    setDeletingId(id);
    const result = await deleteBpoTask(id);
    setDeletingId(null);
    if ("error" in result) alert(result.error);
  }

  const visibleDepartments = selectedDept ? DEPARTMENTS.filter((d) => d === selectedDept) : DEPARTMENTS;

  return (
    <div>
      {showCreate && (
        <TaskForm assignees={assignees} onCancel={onCloseCreate} action={createBpoTask} />
      )}

      {selectedDept && (
        <div className="flex items-center justify-between mb-4 bg-white border border-ink/10 px-4 py-2.5 print:hidden">
          <span className="text-[13px] text-ink">
            Mostrando só <strong>{DEPARTMENT_LABEL[selectedDept]}</strong>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="font-mono text-[11px] uppercase tracking-[0.05em] border border-ink/15 rounded-full px-3.5 py-1.5"
            >
              Imprimir
            </button>
            <button
              onClick={onClearSelectedDept}
              className="font-mono text-[11px] uppercase tracking-[0.05em] text-steel hover:text-ink"
            >
              Ver todos
            </button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhuma tarefa de BPO cadastrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {visibleDepartments.map((dept) => {
            const deptTasks = tasks.filter((t) => t.department === dept);
            if (deptTasks.length === 0) return null;

            return (
              <div key={dept}>
                <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
                  {DEPARTMENT_LABEL[dept]} · {deptTasks.length}
                </h2>
                <div className="bg-white border border-ink/10 divide-y divide-ink/10">
                  {deptTasks.map((task) =>
                    editingId === task.id ? (
                      <div key={task.id} className="p-4">
                        <TaskForm
                          task={task}
                          assignees={assignees}
                          onCancel={() => setEditingId(null)}
                          action={updateBpoTask.bind(null, task.id)}
                        />
                      </div>
                    ) : (
                      <div
                        key={task.id}
                        className={`p-4 flex items-start justify-between gap-6 flex-wrap ${
                          isPriorityTask(task) ? "bg-red-50" : ""
                        }`}
                      >
                        <div className="min-w-[240px]">
                          <div className="text-[14.5px] font-medium text-ink flex items-center gap-2">
                            {task.title}
                            {isPriorityTask(task) && (
                              <span className="text-[10px] font-mono uppercase tracking-[0.05em] text-red-700 border border-red-300 rounded-full px-2 py-0.5">
                                Prioritária
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-[13px] text-steel mt-1">{task.description}</div>
                          )}
                          <div className="text-[12px] text-steel mt-1.5">
                            {task.assigned_to ? assigneeNames[task.assigned_to] ?? "—" : "Sem responsável"}
                            {task.due_date &&
                              ` · vence em ${new Date(task.due_date).toLocaleDateString("pt-BR")}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {task.is_synthetic && <SyntheticBadge />}
                          <span
                            className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${
                              STATUS_CLASSES[task.status] ?? "text-steel border-ink/15"
                            }`}
                          >
                            {STATUS_LABEL[task.status] ?? task.status}
                          </span>
                          <button
                            onClick={() => setEditingId(task.id)}
                            aria-label="Editar"
                            className="text-[15px] text-steel hover:text-ink"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            disabled={deletingId === task.id}
                            aria-label="Excluir"
                            className="text-[15px] text-red-700 hover:text-red-900 disabled:opacity-40"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
