import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcee',
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#fffcee',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        alignItems: 'center',
        // marginTop: 30
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginTop: 70
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 70
    },
    actionButton: {
        padding: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        overflow: 'hidden',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    activeFilter: {
        backgroundColor: '#007bff',
    },
    filterText: {
        color: '#6c757d',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContainer: {
        paddingBottom: 16,
    },
    dateGroup: {
        marginTop: 16,
    },
    dateHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: '#6c757d',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        color: '#6c757d',
        fontSize: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    readItem: {
        backgroundColor: '#f9f9f9',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    content: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#fff',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007bff',
        alignSelf: 'center',
        marginLeft: 8,
    },
});