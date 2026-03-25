import { IPostgres } from '@infrastructure/repositories/config';
import { PoolClient } from 'pg';

export class TransactionManager {
    private connection!: PoolClient

    constructor(private db: IPostgres) { }

    async beginTransaction(): Promise<void> {
        this.connection = await this.db.postgresDb.connect();
        await this.connection.query('BEGIN');
    }

    async commit(): Promise<void> {
        await this.connection.query('COMMIT');
        this.connection.release();
    }

    async rollback(): Promise<void> {
        await this.connection.query('ROLLBACK');
        this.connection.release();
    }

    async executeInTransaction<T>(
        fn: (_connection: PoolClient) => Promise<T>,
        rollback?: () => Promise<void>,
    ): Promise<T> {
        await this.beginTransaction();
        try {
            const result = await fn(this.connection);
            await this.commit();
            return result;
        } catch (error) {
            await this.rollback();
            if (rollback) {
                await rollback();
            }
            throw error;
        }
    }
}