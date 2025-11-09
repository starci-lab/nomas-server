import { Types } from "mongoose"

/**
 * Create a Mongoose ObjectId from any string.
 * If the string is not a valid ObjectId, a deterministic ObjectId is generated
 * by hashing the input (ensures consistent output for the same string).
 *
 * @param id - Any string value.
 * @returns A valid Types.ObjectId instance (always).
 *
 * Example:
 * ```ts
 * const id1 = createObjectId("pet-1")
 * const id2 = createObjectId("pet-1") // same value → same ObjectId
 * ```
 */
export const createObjectId = (id: string): Types.ObjectId => {
    try {
        // if it's already a valid ObjectId string, use directly
        if (Types.ObjectId.isValid(id)) {
            return new Types.ObjectId(id)
        }

        // otherwise, create deterministic hex hash (24 chars)
        const hash = Buffer.from(id).toString("hex").slice(0, 24).padEnd(24, "0")
        return new Types.ObjectId(hash)
    } catch {
        // fallback random ObjectId if something goes wrong
        return new Types.ObjectId()
    }
}