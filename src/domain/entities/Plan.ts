import { IPlanFeature } from '../value-objects';

export class Plan {
    public features: IPlanFeature[] = [];

    public id: string;
    public name: string | null;
    public description: string | null;
    public price: number | null;

    constructor({
        id,
        name = null,
        description = null,
        price = null,
    }: {
        id: string;
        name?: string | null;
        description?: string | null;
        price?: number | null;
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
    }
}
