import { db } from '@/firebase/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';

class ResourceManager {
    constructor(collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }

    // Private helper methods
    _collectionRef() {
        return collection(this.db, this.collectionName);
    }

    _docRef(id) {
        return doc(this.db, this.collectionName, id);
    }

    // Get all documents
    async getAll(filters = {}) {
        try {
            let q = this._collectionRef();
            
            // Apply filters if provided
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }
            
            // Order by date if the collection is sessions
            if (this.collectionName === 'sessions') {
                try {
                    q = query(q, orderBy('dateTime', 'desc'));
                } catch (error) {
                    if (error.message.includes('requires an index')) {
                        console.warn('Index not yet created, fetching without ordering');
                        // If index is not created, fetch without ordering
                        q = this._collectionRef();
                    } else {
                        throw error;
                    }
                }
            }
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                // Keep Firestore Timestamps as is - they will be handled by the components
                return { 
                    id: doc.id, 
                    ...data,
                    // Ensure dateTime is a Firestore Timestamp
                    dateTime: data.dateTime || null
                };
            });
        } catch (error) {
            console.error(`❌ Failed to fetch documents from '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Get a single document by ID
    async get(id) {
        try {
            const docSnap = await getDoc(this._docRef(id));
            if (!docSnap.exists()) throw new Error("Document not found");
            const data = docSnap.data();
            return { 
                id: docSnap.id, 
                ...data,
                // Ensure dateTime is a Firestore Timestamp
                dateTime: data.dateTime || null
            };
        } catch (error) {
            console.error(`❌ Failed to fetch document '${id}' from '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Add a new document
    async addResource(resource) {
        try {
            const docRef = await addDoc(this._collectionRef(), {
                ...resource,
                createdAt: new Date()
            });
            console.log(`✅ Document added to '${this.collectionName}' with ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error(`❌ Failed to add document to '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Update an existing document
    async updateResource(id, updatedData) {
        try {
            await updateDoc(this._docRef(id), updatedData);
            console.log(`✅ Document '${id}' updated in '${this.collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to update document '${id}' in '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Delete a document
    async deleteResource(id) {
        try {
            await deleteDoc(this._docRef(id));
            console.log(`🗑️ Document '${id}' deleted from '${this.collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to delete document '${id}' from '${this.collectionName}':`, error);
            throw error;
        }
    }
}

// 🔧 Instantiate managers for each collection
export const trainerManager = new ResourceManager('trainers');
export const sessionManager = new ResourceManager('sessions');
export const userManager = new ResourceManager('users');
