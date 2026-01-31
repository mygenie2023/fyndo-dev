import JobCard from "../JobCard";

export default function JobCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <JobCard
        id="1"
        serviceType="Ploughing"
        date="Mar 20, 2024"
        time="8:00 AM"
        duration={2}
        associatesNeeded={3}
        budget={5000}
        location="Pune, Maharashtra"
        skillLevel="Intermediate"
        status="Open"
        interestedCount={5}
        onExpressInterest={() => console.log("Express Interest clicked")}
        onViewDetails={() => console.log("View Details clicked")}
      />
      
      <JobCard
        id="2"
        serviceType="Harvesting"
        date="Mar 25, 2024"
        time="6:00 AM"
        duration={5}
        associatesNeeded={8}
        budget={12000}
        location="Nashik, Maharashtra"
        skillLevel="Expert"
        status="Assigned"
        interestedCount={12}
        onViewDetails={() => console.log("View Details clicked")}
        showActions={false}
      />
    </div>
  );
}
