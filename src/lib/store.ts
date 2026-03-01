
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import initialData from './initial-dataset.json';
import { SensorReading, simulateSensorStep } from './ai-sensor-engine';

export type UserRole = 'Corporation Commissioner' | 'Ward Admin' | 'Zone Admin' | 'Worker' | 'Citizen';
export type AppLanguage = 'en' | 'ta';

export interface TeamMember {
  id: string;
  name: string;
  age: number;
  contactNumber: string;
  address: string;
}

export interface User {
  id: string;
  password?: string;
  name: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
  teamNumber?: string;
  rewardPoints: number;
  members?: TeamMember[];
  age?: number;
  contactNumber?: string;
  address?: string;
  teamMembers?: string[]; // Simplified names list if needed
  teamRoster?: TeamMember[]; // Detailed objects for members
}

export type TaskType = 'Sensor' | 'Citizen Public' | 'Citizen Private';
export type SensorSubType = 'Dustbin' | 'Drainage' | 'Water' | 'Toilet' | 'Napkin';

export interface Task {
  id: string;
  name: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Partially Completed' | 'Completed';
  type: TaskType;
  subType?: SensorSubType;
  assignedTo?: string;
  assignedAt?: string;
  wardId: string;
  zoneId: string;
  createdAt: string;
  imageProof?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
  citizenId?: string;
  aiPriority?: 'Critical' | 'High' | 'Medium' | 'Low';
  wasteType?: string;
  estimatedWeight?: number;
  distance?: string;
}

export interface MemberAttendance {
  name: string;
  status: 'Present' | 'Absent';
}

export interface TeamAttendance {
  teamNumber: string;
  date: string;
  members: MemberAttendance[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  read: boolean;
}

interface AppState {
  currentUser: User | null;
  tasks: Task[];
  users: User[];
  attendance: Record<string, TeamAttendance>;
  language: AppLanguage | null;
  notifications: Notification[];
  sensors: SensorReading[];
  isDemoRunning: boolean;
  demoSpeed: number;
  
  setCurrentUser: (user: User | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  addUser: (user: User) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setAttendance: (workerId: string, members: MemberAttendance[]) => void;
  addCitizenRewards: (citizenId: string, points: number) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  markNotificationRead: (id: string) => void;
  setDemoRunning: (running: boolean, speed?: number) => void;
  updateSensors: () => void;
  triggerSensorAlert: (sensorId: string) => void;
  resetToDataset: () => void;
}

const INITIAL_SENSORS: SensorReading[] = [
  { zoneId: 'ZA - Zone A (North)', sensorType: 'dustbin', currentLevel: 45, location: 'Arasaradi Junction', wardId: 'WA01', timestamp: Date.now(), predictedFillTime: 120, confidenceScore: 0.87, anomalyScore: 0.1, status: 'ok' },
  { zoneId: 'ZA - Zone A (North)', sensorType: 'toilet_napkins', currentLevel: 22, location: 'North Stand Toilet', wardId: 'WA01', timestamp: Date.now(), predictedFillTime: 45, confidenceScore: 0.94, anomalyScore: 0.05, status: 'warning' },
  { zoneId: 'ZE - Zone E (Central)', sensorType: 'dustbin', currentLevel: 88, location: 'Simmakkal Clock Tower', wardId: 'WE01', timestamp: Date.now(), predictedFillTime: 15, confidenceScore: 0.91, anomalyScore: 0.2, status: 'warning' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      tasks: (initialData.tasks as Task[]),
      users: (initialData.users as User[]),
      attendance: {},
      language: null,
      notifications: [],
      isDemoRunning: false,
      demoSpeed: 1,
      sensors: INITIAL_SENSORS,

      setCurrentUser: (user) => set({ currentUser: user }),
      setLanguage: (lang) => set({ language: lang }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) => set((state) => {
        const updatedTasks = state.tasks.map((t) => {
          if (t.id === taskId) {
            const updatedTask = { ...t, ...updates };
            if (updates.assignedTo && !t.assignedTo) {
              updatedTask.assignedAt = new Date().toISOString();
            }
            if (updates.status === 'Completed' && t.status !== 'Completed' && t.assignedTo) {
              const workerId = t.assignedTo;
              setTimeout(() => {
                set((innerState) => ({
                  users: innerState.users.map(u => 
                    u.id === workerId ? { ...u, rewardPoints: (u.rewardPoints || 0) + 100 } : u
                  ),
                  currentUser: innerState.currentUser?.id === workerId 
                    ? { ...innerState.currentUser, rewardPoints: (innerState.currentUser.rewardPoints || 0) + 100 }
                    : innerState.currentUser
                }));
              }, 0);
            }
            return updatedTask;
          }
          return t;
        });
        return { tasks: updatedTasks };
      }),
      updateUser: (userId, updates) => set((state) => {
        const updatedUsers = state.users.map((u) => u.id === userId ? { ...u, ...updates } : u);
        const currentUser = state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser;
        return { users: updatedUsers, currentUser };
      }),
      setAttendance: (workerId, members) => set((state) => ({
        attendance: {
          ...state.attendance,
          [workerId]: {
            teamNumber: workerId,
            date: new Date().toLocaleDateString(),
            members
          }
        }
      })),
      addNotification: (notif) => set((state) => ({
        notifications: [{
          ...notif,
          id: `notif-${Date.now()}`,
          time: new Date().toISOString(),
          read: false
        }, ...state.notifications].slice(0, 20)
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      setDemoRunning: (running, speed = 1) => set({ isDemoRunning: running, demoSpeed: speed }),
      updateSensors: () => set((state) => {
        if (!state.isDemoRunning) return state;
        const newSensors = state.sensors.map(s => simulateSensorStep(s, state.demoSpeed));
        
        // Auto-trigger tasks for critical sensors
        newSensors.forEach(s => {
          if (s.status === 'critical' && !state.tasks.find(t => t.location === s.location && t.status !== 'Completed')) {
            const newTask: Task = {
              id: `sensor-${Date.now()}-${Math.random()}`,
              name: `Critical Alert: ${s.sensorType}`,
              location: s.location,
              status: 'Pending',
              type: 'Sensor',
              wardId: s.wardId,
              zoneId: s.zoneId,
              createdAt: new Date().toISOString(),
              aiPriority: 'Critical'
            };
            get().addTask(newTask);
            get().addNotification({
              title: 'Critical Sensor Alert',
              message: `${s.sensorType} at ${s.location} is at ${s.currentLevel}%`,
              type: 'alert'
            });
          }
        });

        return { sensors: newSensors };
      }),
      triggerSensorAlert: (sensorId) => set((state) => {
        const newSensors = state.sensors.map(s => 
          (s.location === sensorId) ? { ...s, currentLevel: 98, status: 'critical' as const } : s
        );
        return { sensors: newSensors };
      }),
      addCitizenRewards: (citizenId, points) => set((state) => {
        const updatedUsers = state.users.map(u => 
          u.id === citizenId ? { ...u, rewardPoints: (u.rewardPoints || 0) + points } : u
        );
        const currentUser = state.currentUser?.id === citizenId 
          ? { ...state.currentUser, rewardPoints: (state.currentUser.rewardPoints || 0) + (points || 0) }
          : state.currentUser;
        return {
          users: updatedUsers,
          currentUser: currentUser as User | null
        };
      }),
      resetToDataset: () => set({ 
        tasks: (initialData.tasks as Task[]), 
        users: (initialData.users as User[]),
        attendance: {},
        currentUser: null,
        language: null,
        notifications: [],
        sensors: INITIAL_SENSORS,
        isDemoRunning: false
      })
    }),
    {
      name: 'clean-madurai-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
