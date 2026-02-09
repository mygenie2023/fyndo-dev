import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, X, Upload, Check, Loader2 } from "lucide-react";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import LocationPicker from "@/components/LocationPicker";
import type { Service } from "@shared/schema";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user, setUser, isLoading } = useUser();
  const { toast } = useToast();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  const availableSkills = services.filter(s => s.isActive === 1).map(s => s.name);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phoneNumber || "",
    skills: (user?.skills || []) as string[],
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth || "",
    expectedDailySalary: user?.expectedDailySalary?.toString() || "",
    travelDistance: user?.travelDistance?.toString() || "",
    comfortableStaying: user?.comfortableStaying || "",
  });

  const [selectedLocation, setSelectedLocation] = useState<any>(
    user?.latitude && user?.longitude
      ? { lat: parseFloat(user.latitude as string), lng: parseFloat(user.longitude as string), address: user.location || "" }
      : null
  );

  const [aadharFrontUrl, setAadharFrontUrl] = useState(user?.aadharFrontUrl || "");
  const [aadharBackUrl, setAadharBackUrl] = useState(user?.aadharBackUrl || "");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phoneNumber,
        skills: (user.skills || []) as string[],
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        expectedDailySalary: user.expectedDailySalary?.toString() || "",
        travelDistance: user.travelDistance?.toString() || "",
        comfortableStaying: user.comfortableStaying || "",
      });
      if (user.latitude && user.longitude) {
        setSelectedLocation({
          lat: parseFloat(user.latitude as string),
          lng: parseFloat(user.longitude as string),
          address: user.location || "",
        });
      }
      setAadharFrontUrl(user.aadharFrontUrl || "");
      setAadharBackUrl(user.aadharBackUrl || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      setLocation("/profile");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleAadharFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    try {
      const response = await uploadFile(file);
      if (response) {
        setAadharFrontUrl(response.objectPath);
      }
    } finally {
      setUploadingFront(false);
    }
  };

  const handleAadharBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    try {
      const response = await uploadFile(file);
      if (response) {
        setAadharBackUrl(response.objectPath);
      }
    } finally {
      setUploadingBack(false);
    }
  };

  const handleSave = () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const updates: any = {
      name: formData.name.trim(),
    };

    if (selectedLocation) {
      updates.latitude = selectedLocation.lat.toString();
      updates.longitude = selectedLocation.lng.toString();
      updates.location = selectedLocation.address;
    }

    if (user.userType?.toLowerCase() === "associate") {
      if (formData.skills.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one skill",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      if (!aadharFrontUrl || !aadharBackUrl) {
        toast({
          title: "Error",
          description: "Both Aadhar front and back images are required",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      updates.skills = formData.skills;
      updates.gender = formData.gender || undefined;
      updates.dateOfBirth = formData.dateOfBirth || undefined;
      updates.expectedDailySalary = formData.expectedDailySalary ? parseInt(formData.expectedDailySalary) : undefined;
      updates.travelDistance = formData.travelDistance ? parseInt(formData.travelDistance) : undefined;
      updates.comfortableStaying = formData.comfortableStaying || undefined;
      updates.aadharFrontUrl = aadharFrontUrl || undefined;
      updates.aadharBackUrl = aadharBackUrl || undefined;
    }

    updateProfileMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to edit your profile</p>
      </div>
    );
  }

  const isAssociate = user.userType?.toLowerCase() === "associate";

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 h-14 flex items-center">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation("/profile")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Edit Profile</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                disabled
                data-testid="input-phone"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your phone number
              </p>
            </div>

            {isAssociate && (
              <>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    className="flex gap-4"
                    data-testid="radio-gender"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="edit-male" data-testid="radio-gender-male" />
                      <Label htmlFor="edit-male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="edit-female" data-testid="radio-gender-female" />
                      <Label htmlFor="edit-female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="edit-other" data-testid="radio-gender-other" />
                      <Label htmlFor="edit-other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    data-testid="input-dob"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Expected Daily Salary (Rs.)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.expectedDailySalary}
                    onChange={(e) => setFormData({ ...formData, expectedDailySalary: e.target.value })}
                    placeholder="Enter expected daily salary"
                    data-testid="input-salary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Travel Distance (km)</Label>
                  <Select
                    value={formData.travelDistance}
                    onValueChange={(value) => setFormData({ ...formData, travelDistance: value })}
                  >
                    <SelectTrigger data-testid="select-travel-distance">
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Up to 5 km</SelectItem>
                      <SelectItem value="10">Up to 10 km</SelectItem>
                      <SelectItem value="20">Up to 20 km</SelectItem>
                      <SelectItem value="50">Up to 50 km</SelectItem>
                      <SelectItem value="100">Up to 100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Comfortable Staying at Farm?</Label>
                  <Select
                    value={formData.comfortableStaying}
                    onValueChange={(value) => setFormData({ ...formData, comfortableStaying: value })}
                  >
                    <SelectTrigger data-testid="select-comfortable-staying">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {isAssociate && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Skills</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} className="gap-1" data-testid={`badge-skill-${skill}`}>
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover-elevate rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select value={newSkill} onValueChange={addSkill}>
                  <SelectTrigger data-testid="select-add-skill">
                    <SelectValue placeholder="Add a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills
                      .filter((skill) => !formData.skills.includes(skill))
                      .map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {isAssociate && (
          <Card>
            <CardHeader>
              <CardTitle>KYC Documents - Aadhar Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aadhar Front Side</Label>
                <input
                  type="file"
                  ref={frontInputRef}
                  onChange={handleAadharFrontUpload}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-aadhar-front-file"
                />
                <Button
                  type="button"
                  variant={aadharFrontUrl ? "default" : "outline"}
                  className="w-full"
                  onClick={() => frontInputRef.current?.click()}
                  disabled={uploadingFront}
                  data-testid="button-aadhar-front"
                >
                  {uploadingFront ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : aadharFrontUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Front Side Uploaded (Click to Replace)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Front Side
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Aadhar Back Side</Label>
                <input
                  type="file"
                  ref={backInputRef}
                  onChange={handleAadharBackUpload}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-aadhar-back-file"
                />
                <Button
                  type="button"
                  variant={aadharBackUrl ? "default" : "outline"}
                  className="w-full"
                  onClick={() => backInputRef.current?.click()}
                  disabled={uploadingBack}
                  data-testid="button-aadhar-back"
                >
                  {uploadingBack ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : aadharBackUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Back Side Uploaded (Click to Replace)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Back Side
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationPicker
              onLocationSelect={(location) => setSelectedLocation(location)}
              currentLocation={selectedLocation || undefined}
            />
          </CardContent>
        </Card>

        <div className="sticky bottom-0 bg-background pt-4">
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || uploadingFront || uploadingBack}
            className="w-full h-12"
            data-testid="button-save"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
