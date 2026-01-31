import { useState } from "react";
import ServiceTypeGrid from "../ServiceTypeGrid";

export default function ServiceTypeGridExample() {
  const [selected, setSelected] = useState<string>();

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-semibold mb-4">Select Service Type</h2>
      <ServiceTypeGrid
        selectedService={selected}
        onSelectService={setSelected}
      />
      {selected && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Selected: {selected}
        </p>
      )}
    </div>
  );
}
