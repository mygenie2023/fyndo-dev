import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LocationPicker from "@/components/LocationPicker";
import { useUser } from "@/lib/userContext";
import { User, Tractor, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ProfileSetup() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [userType, setUserType] = useState<"farmer" | "associate" | null>(null);
  
  // Associate-specific fields
  const [gender, setGender] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [expectedDailySalary, setExpectedDailySalary] = useState("");
  const [travelDistance, setTravelDistance] = useState<string>("");
  const [comfortableStaying, setComfortableStaying] = useState<string>("");
  
  // Total steps: 3 for farmers, 4 for associates (extra step for associate details)
  const totalSteps = userType === "associate" ? 4 : 3;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone");
    if (phone) {
      setPhoneNumber(phone);
    }
  }, []);

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/complete-profile", data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      setUser(data);
      setLocation("/jobs");
    },
    onError: () => {
      // Error occurred - profile will not be created
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 2) return userType !== null;
    
    if (userType === "associate") {
      // Step 3 is associate details, Step 4 is location
      if (currentStep === 3) {
        return gender !== "" && 
               dateOfBirth !== "" && 
               expectedDailySalary !== "" && 
               travelDistance !== "" && 
               comfortableStaying !== "";
      }
      if (currentStep === 4) return selectedLocation !== null;
    } else {
      // Farmer: Step 3 is location
      if (currentStep === 3) return selectedLocation !== null;
    }
    return false;
  };

  const handleComplete = () => {
    if (!name || !selectedLocation || !userType) return;

    const baseData = {
      name,
      phoneNumber,
      userType,
      latitude: selectedLocation.lat.toString(),
      longitude: selectedLocation.lng.toString(),
      location: selectedLocation.address,
    };

    if (userType === "associate") {
      profileMutation.mutate({
        ...baseData,
        skills: [],
        skillLevel: "Beginner",
        hourlyRate: 100,
        gender,
        dateOfBirth,
        expectedDailySalary: parseInt(expectedDailySalary) || 0,
        travelDistance: parseInt(travelDistance) || 0,
        comfortableStaying,
      });
    } else {
      profileMutation.mutate(baseData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-md mx-auto space-y-8 pt-8 relative z-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{t("profileSetup.title")}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            {t("profileSetup.stepOf", { current: currentStep, total: totalSteps })}
          </p>
          
          <div className="flex gap-2 justify-center pt-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index + 1 === currentStep
                    ? "w-8 bg-primary"
                    : index + 1 < currentStep
                    ? "w-6 bg-primary/60"
                    : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-card-border/60">
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    {t("profileSetup.name")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("profileSetup.namePlaceholder")}
                    className="h-12 text-base"
                    autoFocus
                    data-testid="input-name"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">{t("profileSetup.userType")}</Label>
                  <div className="space-y-3 pt-2">
                    <div
                      onClick={() => {
                        setUserType("farmer");
                        setTimeout(() => handleNext(), 300);
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                        userType === "farmer"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-card-border"
                      }`}
                      data-testid="card-user-type-farmer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-3 transition-colors ${
                          userType === "farmer" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Tractor className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{t("profileSetup.farmer")}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("profileSetup.farmerDescription")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setUserType("associate");
                        setTimeout(() => handleNext(), 300);
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                        userType === "associate"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-card-border"
                      }`}
                      data-testid="card-user-type-associate"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-3 transition-colors ${
                          userType === "associate" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <User className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{t("profileSetup.associate")}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("profileSetup.associateDescription")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Associate Details (for associates) or Location (for farmers) */}
            {currentStep === 3 && userType === "associate" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h3 className="text-base font-semibold text-center">{t("profileSetup.associateDetails", "Tell us more about yourself")}</h3>
                
                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("profileSetup.gender", "Gender")}</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11" data-testid="select-gender">
                      <SelectValue placeholder={t("profileSetup.selectGender", "Select gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("profileSetup.male", "Male")}</SelectItem>
                      <SelectItem value="female">{t("profileSetup.female", "Female")}</SelectItem>
                      <SelectItem value="other">{t("profileSetup.other", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("profileSetup.dateOfBirth", "Date of Birth")}</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-11"
                    data-testid="input-date-of-birth"
                  />
                </div>

                {/* Expected Daily Salary */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("profileSetup.expectedDailySalary", "Expected Daily Salary (Rs.)")}</Label>
                  <Input
                    type="number"
                    value={expectedDailySalary}
                    onChange={(e) => setExpectedDailySalary(e.target.value)}
                    placeholder={t("profileSetup.enterSalary", "Enter expected daily salary")}
                    className="h-11"
                    min="0"
                    data-testid="input-expected-salary"
                  />
                </div>

                {/* Travel Distance */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("profileSetup.travelDistance", "How many kilometers are you willing to travel?")}</Label>
                  <Select value={travelDistance} onValueChange={setTravelDistance}>
                    <SelectTrigger className="h-11" data-testid="select-travel-distance">
                      <SelectValue placeholder={t("profileSetup.selectDistance", "Select distance")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="30">30 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="100">100+ km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comfortable Staying */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("profileSetup.comfortableStaying", "Are you comfortable staying at farmer's location?")}</Label>
                  <RadioGroup value={comfortableStaying} onValueChange={setComfortableStaying} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="stay-yes" data-testid="radio-stay-yes" />
                      <Label htmlFor="stay-yes" className="font-normal cursor-pointer">{t("profileSetup.yes", "Yes")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="stay-no" data-testid="radio-stay-no" />
                      <Label htmlFor="stay-no" className="font-normal cursor-pointer">{t("profileSetup.no", "No")}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 3 for Farmers: Location */}
            {currentStep === 3 && userType === "farmer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">{t("profileSetup.location")}</Label>
                  <LocationPicker
                    onLocationSelect={setSelectedLocation}
                    currentLocation={selectedLocation}
                    showCoordinates={true}
                  />
                </div>
              </div>
            )}

            {/* Step 4 for Associates: Location */}
            {currentStep === 4 && userType === "associate" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">{t("profileSetup.location")}</Label>
                  <LocationPicker
                    onLocationSelect={setSelectedLocation}
                    currentLocation={selectedLocation}
                    showCoordinates={true}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="w-20"
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-12 shadow-sm"
              data-testid="button-next"
            >
              {t("profileSetup.next")}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || profileMutation.isPending}
              className="flex-1 h-12 shadow-sm"
              data-testid="button-complete-setup"
            >
              {profileMutation.isPending ? t("profileSetup.creating") : t("profileSetup.submit")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
