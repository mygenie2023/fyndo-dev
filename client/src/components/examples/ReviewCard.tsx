import ReviewCard from "../ReviewCard";

export default function ReviewCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <ReviewCard
        reviewerName="Amit Patel"
        rating={5}
        date="2 days ago"
        reviewText="Excellent work! Very professional and completed the ploughing ahead of schedule. Highly recommended for any farming work."
        jobType="Ploughing Service"
      />
      
      <ReviewCard
        reviewerName="Sunita Deshmukh"
        rating={4}
        date="1 week ago"
        reviewText="Good experience overall. The work was done well but could have been faster. Would hire again."
        jobType="Harvesting"
      />
    </div>
  );
}
