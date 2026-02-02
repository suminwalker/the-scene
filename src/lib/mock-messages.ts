
export interface User {
    id: string;
    name: string;
    handle: string;
    avatar: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
}

export const MOCK_MUTUALS: User[] = [
    {
        id: "grace",
        name: "Grace Victoria",
        handle: "grace.vic",
        avatar: "https://i.pravatar.cc/150?u=grace"
    },
    {
        id: "elise",
        name: "Elise Alexander",
        handle: "elise.alex",
        avatar: "https://i.pravatar.cc/150?u=elise"
    },
    {
        id: "sinead",
        name: "Sinéad",
        handle: "sinead_nyc",
        avatar: "https://i.pravatar.cc/150?u=sinead"
    },
    {
        id: "aidan",
        name: "Aidan Thomas",
        handle: "aidan.t",
        avatar: "https://i.pravatar.cc/150?u=aidan"
    },
    {
        id: "joey",
        name: "Joey Mulcahy",
        handle: "joey.mulcahy",
        avatar: "https://i.pravatar.cc/150?u=joey"
    },
    {
        id: "sarah",
        name: "Sarah Jenkins",
        handle: "sarah.jenkins",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        id: "alex",
        name: "Alex Chen",
        handle: "alexc",
        avatar: "https://i.pravatar.cc/150?u=alex"
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        participants: [MOCK_MUTUALS[0]],
        lastMessage: {
            id: "m1",
            content: "Seen 15h ago", // Mimicking the screenshot style where sometimes it just says status
            senderId: "suminwalker", // User sent last
            timestamp: "15h ago",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c2",
        participants: [MOCK_MUTUALS[1]],
        lastMessage: {
            id: "m2",
            content: "Sent Friday",
            senderId: "suminwalker",
            timestamp: "Friday",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c3",
        participants: [MOCK_MUTUALS[2]],
        lastMessage: {
            id: "m3",
            content: "Have you been to that new spot in SoHo?",
            senderId: "sinead",
            timestamp: "Friday",
            isRead: false
        },
        unreadCount: 1
    },
    {
        id: "c4",
        participants: [MOCK_MUTUALS[3]],
        lastMessage: {
            id: "m4",
            content: "Sent Friday",
            senderId: "suminwalker",
            timestamp: "Friday",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c5",
        participants: [MOCK_MUTUALS[4]],
        lastMessage: {
            id: "m5",
            content: "Sent a message · 1w",
            senderId: "suminwalker",
            timestamp: "1w",
            isRead: true
        },
        unreadCount: 0
    }
];
