import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft } from "lucide-react";

export default function SubmitReview() {
  const [, setLocation] = useLocation();
  const [reviews, setReviews] = useState([
    {
      associateId: "1",
      name: "Rajesh Kumar",
      rating: 0,
      reviewText: "",
    },
    {
      associateId: "2",
      name: "Priya Sharma",
      rating: 0,
      reviewText: "",
    },
    {
      associateId: "3",
      name: "Suresh Patil",
      rating: 0,
      reviewText: "",
    },
  ]);

  const handleRatingChange = (index: number, rating: number) => {
    const newReviews = [...reviews];
    newReviews[index].rating = rating;
    setReviews(newReviews);
  };

  const handleReviewTextChange = (index: number, text: string) => {
    const newReviews = [...reviews];
    newReviews[index].reviewText = text;
    setReviews(newReviews);
  };

  const handleSubmit = () => {
    console.log("Submitting reviews:", reviews);
    setLocation("/dashboard");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const allReviewsComplete = reviews.every((r) => r.rating > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 h-14 flex items-center">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Review Associates</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold">Rate Your Experience</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Help other farmers by reviewing the associates' work
          </p>
        </div>

        {reviews.map((review, index) => (
          <Card key={review.associateId}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" alt={review.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(review.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{review.name}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(index, star)}
                      className="focus:outline-none hover-elevate rounded-full p-1"
                      data-testid={`button-star-${index}-${star}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Review (Optional)</p>
                <Textarea
                  value={review.reviewText}
                  onChange={(e) => handleReviewTextChange(index, e.target.value)}
                  placeholder="Share your experience with this associate..."
                  rows={3}
                  data-testid={`input-review-${index}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="sticky bottom-0 bg-background pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full h-12"
            disabled={!allReviewsComplete}
            data-testid="button-submit-reviews"
          >
            Submit Reviews
          </Button>
        </div>
      </div>
    </div>
  );
}
