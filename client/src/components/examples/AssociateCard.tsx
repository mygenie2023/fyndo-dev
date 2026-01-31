import AssociateCard from "../AssociateCard";

export default function AssociateCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <AssociateCard
        id="1"
        name="Rajesh Kumar"
        skills={["Ploughing", "Sowing", "Harvesting"]}
        skillLevel="Expert"
        hourlyRate={150}
        rating={4.8}
        workHistoryCount={45}
        onShortlist={() => console.log("Shortlist clicked")}
        onViewProfile={() => console.log("View Profile clicked")}
        isShortlisted={false}
      />

      <AssociateCard
        id="2"
        name="Priya Sharma"
        skills={["Irrigation", "Fertilizing", "General Labour", "Pest Control"]}
        skillLevel="Intermediate"
        hourlyRate={120}
        rating={4.5}
        workHistoryCount={28}
        onShortlist={() => console.log("Shortlist clicked")}
        onViewProfile={() => console.log("View Profile clicked")}
        isShortlisted={true}
      />
    </div>
  );
}
