import {RowDataPacket} from 'mysql2/promise';

export interface User extends RowDataPacket, UserType {
}

export interface Event extends RowDataPacket, EventType {
}

export type EventType = {
    eventId?: number;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    // startDate: String;
    // endDate: String;
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