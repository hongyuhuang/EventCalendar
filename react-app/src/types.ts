export type EventType = {
    eventId?: number;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description: String;
}

export type UserType = {
    id?: number;
    firstName: string;
    lastName: string;
    isAdmin: Boolean;
    email: String;
    password: String;
}