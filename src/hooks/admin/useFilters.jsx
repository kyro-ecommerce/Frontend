import {useCallback, useState} from 'react';

export const useFilters = (initialState = {}) => {
    const [filters, setFilters] = useState(initialState);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({startDate: '', endDate: ''});

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setFilters(prev => ({...prev, search: term}));
    }, []);

    const handleFilterChange = useCallback((filterType, value) => {
        setFilters(prev => ({...prev, [filterType]: value}));
    }, []);

    const handleDateFilter = useCallback((startDate, endDate) => {
        setDateRange({startDate, endDate});
        setFilters(prev => ({...prev, startDate, endDate}));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(initialState);
        setSearchTerm('');
        setDateRange({startDate: '', endDate: ''});
    }, [initialState]);

    return {
        filters,
        searchTerm,
        dateRange,
        handleSearch,
        handleFilterChange,
        handleDateFilter,
        resetFilters
    };
}; 