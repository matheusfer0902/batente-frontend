import { Suspense } from "react";
import { AccessMonitor } from "@/components/access/AccessMonitor";

export default function MonitorPage() {
  return (
    <Suspense>
      <AccessMonitor />
    </Suspense>
  );
}
