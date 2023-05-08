export interface Event {
    eventId: number;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface EventFormData {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface User {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
}