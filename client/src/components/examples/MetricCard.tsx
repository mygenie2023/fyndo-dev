import MetricCard from "../MetricCard";
import { DollarSign, Briefcase, Star, Clock } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 max-w-2xl">
      <MetricCard
        icon={DollarSign}
        label="Total Earnings"
        value="₹45,200"
        trend={{ value: 12, isPositive: true }}
      />
      <MetricCard
        icon={Briefcase}
        label="Jobs Completed"
        value={28}
        description="This month"
      />
      <MetricCard
        icon={Star}
        label="Average Rating"
        value={4.8}
      />
      <MetricCard
        icon={Clock}
        label="Pending Payments"
        value="₹3,500"
      />
    </div>
  );
}
