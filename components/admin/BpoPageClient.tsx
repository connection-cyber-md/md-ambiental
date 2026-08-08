"use client";

import { useState } from "react";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { BpoBoard } from "@/components/admin/BpoBoard";
import { DEPARTMENTS, DEPARTMENT_LABEL, isPriorityTask } from "@/lib/bpo/constants";

type BpoTask = {
  id: string;
  department: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
};

type Assignee = { id: string; full_name: string };

export function BpoPageClient({
  tasks,
  assigneeNames,
  assignees,
}: {
  tasks: BpoTask[];
  assigneeNames: Record<string, string>;
  assignees: Assignee[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const countsByDept = DEPARTMENTS.map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept);
    return {
      dept,
      total: deptTasks.length,
      priority: deptTasks.filter(isPriorityTask).length,
    };
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h1 className="font-display text-[28px] text-black">BPO — Tarefas por departamento</h1>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-4 py-2 whitespace-nowrap"
        >
          {showCreate ? "Fechar" : "+ Nova tarefa"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 print:hidden">
        {countsByDept.map(({ dept, total, priority }) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(selectedDept === dept ? null : dept)}
            className={`text-left bg-white border-[1.5px] rounded-lg p-4 transition-colors ${
              selectedDept === dept ? "border-ink" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            <div className="text-[11px] text-black mb-1">{DEPARTMENT_LABEL[dept]}</div>
            <div className="font-display text-[22px] text-black">{total}</div>
            {priority > 0 && (
              <div className="text-[11px] text-red-700 mt-0.5">
                {priority} prioritária{priority > 1 ? "s" : ""}
              </div>
            )}
          </button>
        ))}
      </div>

      <BpoBoard
        tasks={tasks}
        assigneeNames={assigneeNames}
        assignees={assignees}
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
        selectedDept={selectedDept}
        onClearSelectedDept={() => setSelectedDept(null)}
      />

      <ContextFooter>
        {countsByDept.map(({ dept, total }) => (
          <span key={dept}>
            {DEPARTMENT_LABEL[dept]}: {total}
          </span>
        ))}
      </ContextFooter>
    </div>
  );
}
