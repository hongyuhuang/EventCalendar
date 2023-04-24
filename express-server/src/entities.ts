import { RowDataPacket } from 'mysql2/promise';

export interface User extends RowDataPacket {
    id?: number;
    firstName: string;
    lastName: string;
    isAdmin: Boolean;
    email: String;
    password: String;
}


export interface Event extends RowDataPacket {
    eventId?: number;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description: String;
}