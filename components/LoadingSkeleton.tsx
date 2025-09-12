import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tw } from "twin.macro";

const SkeletonProfileAvatar = tw(Skeleton)`
  h-8 w-48
`;

const SkeletonProfileName = tw(Skeleton)`
  h-6 w-32
`;

const SkeletonProfileDescription = tw(Skeleton)`
  h-4 w-full
`;

export function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonProfileAvatar />
      <Card>
        <CardHeader>
          <SkeletonProfileName />
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonProfileDescription />
          <SkeletonProfileDescription />
        </CardContent>
      </Card>
    </div>
  );
}