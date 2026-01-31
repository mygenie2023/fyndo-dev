import LocationPicker from "../LocationPicker";

export default function LocationPickerExample() {
  return (
    <div className="p-4 max-w-md">
      <LocationPicker
        onLocationSelect={(location) =>
          console.log("Location selected:", location)
        }
      />
    </div>
  );
}
