export type Vehicle = {
    id: string;
    user_id: string;
    make: string;
    model: string;
    year: number;
    odometer_reading: number;
    purchase_cost: number | null;
    purchase_date: string | null;
    fuel_unit: string;
    odometer_unit: string;
};

export type Modification = {
    id: string;
    vehicle_id: string;
    name: string;
    category: string;
    cost: number;
    location: string | null;
    installed_date: string;
    notes: string | null;
    is_wishlist: boolean;
    image_url: string | null;
};

export type Maintenance = {
    id: string;
    vehicle_id: string;
    title: string;
    category: string;
    cost: number;
    provider: string | null;
    date_logged: string;
    odometer_reading: number | null;
    volume: number | null;
    notes: string | null;
    is_upcoming: boolean;
    receipt_url: string | null;
};
