 import { Workflow, AlertTriangle } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useNavigate } from "react-router-dom";
 import { Process } from "@/api/contracts/viewModels";
 
 interface ProcessHealthCardProps {
   processes: Process[];
 }
 
 const statusConfig = {
   draft: { label: "Draft", color: "bg-muted-foreground" },
   active: { label: "Active", color: "bg-success" },
 } as const;
 
 export function ProcessHealthCard({ processes }: ProcessHealthCardProps) {
   const navigate = useNavigate();
   
   const activeProcesses = processes.filter(p => p.status !== "archived");
   const byStatus = {
     draft: activeProcesses.filter(p => p.status === "draft").length,
     active: activeProcesses.filter(p => p.status === "active").length,
   };
 
   // Identify problematic processes
   const withNoActivities = activeProcesses.filter(p => !p.activities || p.activities.length === 0);
   const withNoRequirements = activeProcesses.filter(p => 
     p.activities.every(a => !a.allocatedRequirementIds?.length)
   );
 
   const issues: { label: string; count: number; filter?: string }[] = [];
   if (withNoActivities.length > 0) {
     issues.push({ label: "No activities", count: withNoActivities.length });
   }
   if (withNoRequirements.length > 0) {
     issues.push({ label: "No requirements allocated", count: withNoRequirements.length });
   }
 
   return (
     <div className="mobile-card space-y-3">
       <div className="flex items-center gap-2">
         <Workflow className="w-4 h-4 text-process" />
         <h3 className="font-semibold text-sm">Process Health</h3>
       </div>
       
       {/* Status breakdown */}
       <div className="grid grid-cols-2 gap-2">
         {(["draft", "active"] as const).map((status) => (
           <button
             key={status}
             onClick={() => navigate(`/processes?status=${status}`)}
             className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors"
           >
             <span className={cn(
               "w-2 h-2 rounded-full mb-1",
               statusConfig[status].color
             )} />
             <span className="font-mono text-lg font-bold">{byStatus[status]}</span>
             <span className="text-[10px] text-muted-foreground uppercase">
               {statusConfig[status].label}
             </span>
           </button>
         ))}
       </div>
 
       {/* Issues */}
       {issues.length > 0 && (
         <div className="space-y-1 pt-2 border-t border-border">
           {issues.map((issue, i) => (
             <div 
               key={i}
               className="flex items-center justify-between text-xs"
             >
               <span className="flex items-center gap-1.5 text-warning">
                 <AlertTriangle className="w-3 h-3" />
                 {issue.label}
               </span>
               <span className="font-mono font-medium">{issue.count}</span>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 }