import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
};

export const BookmarkProvider = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    /*
     * bookmark-synchronization-engine
     * Fetches the user's saved article list from the backend.
     * Authenticated-only operation: Returns early if no valid token is present.
     * updates the local state to reflect the persisted database state.
     */
    const fetchBookmarks = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setLoading(true);
        try {
            const response = await axios.get('/api/articles/my/bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data || []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    /*
     * toggle-handler-optimistic
     * Manages the add/remove logic for bookmarks.
     * Updates the UI immediately based on the server response.
     * - If added: Appends to the local list.
     * - If removed: Filters out from the local list.
     * Returns the new boolean state for the UI button.
     */
    const toggleBookmark = async (article) => {
        if (!isAuthenticated || !token) return;

        try {
            const response = await axios.post(`/api/articles/${article._id}/bookmark`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.isBookmarked) {
                setBookmarks(prev => [...prev, article]);
            } else {
                setBookmarks(prev => prev.filter(b => b._id !== article._id));
            }
            return response.data.isBookmarked;
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            return false;
        }
    };

    const isBookmarked = (articleId) => {
        return bookmarks.some(b => b._id === articleId);
    };

    const value = {
        bookmarks,
        loading,
        fetchBookmarks,
        toggleBookmark,
        isBookmarked
    };

    return (
        <BookmarkContext.Provider value={value}>
            {children}
        </BookmarkContext.Provider>
    );
};
