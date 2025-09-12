import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tw } from "twin.macro";

const SkeletonHeader = tw(Skeleton)`
  h-8 w-48
`;

const SkeletonTitle = tw(Skeleton)`
  h-6 w-32
`;

const SkeletonText = tw(Skeleton)`
  h-4 w-full
`;

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <Card>
        <CardHeader>
          <SkeletonTitle />
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonText />
          <SkeletonText />
        </CardContent>
      </Card>
    </div>
  );
}