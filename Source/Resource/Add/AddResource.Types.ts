
export type FResourceType = "GitHub" | "S3";

export type FAddResourceSettings =
{
    Name: string;
    Type: FResourceType;
};
