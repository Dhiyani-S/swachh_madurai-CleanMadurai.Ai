
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import initialData from './initial-dataset.json';

export type UserRole = 'commissioner' | 'ward_admin' | 'zone_admin' | 'worker' | 'citizen';
export type AppLanguage = 'en' | 'ta';

export interface TeamMember {
  workerId: string;
  name: string;
  age: number;
  phone: string;
  address: string;
}

export interface Team {
  id: string;
  zone: string;
  name: string;
  members: TeamMember[];
  supervisorId: string;
}

export interface User {
  id: string;
  password?: string;
  name: string;
  role: UserRole;
  wardId?: string;
  zone?: string;
  teamId?: string;
  rewardPoints: number;
  phone?: string;
  email?: string;
  age?: number;
  address?: string;
  createdByAdmin?: string;
  tasksCompleted?: number;
  correctDisposals?: number;
}

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'partially_completed' | 'completed';
export type TaskSource = 'sensor' | 'citizen_public' | 'citizen_private' | 'admin_manual';

export interface Task {
  id: string;
  work: string;
  place: string;
  status: TaskStatus;
  type?: 'Sensor' | 'Citizen Public' | 'Citizen Private';
  source: TaskSource;
  zone: string;
  teamId?: string;
  assignedTo?: string;
  assignedAt?: string;
  createdAt: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  pointsAwarded?: number;
  disposalVerified?: boolean;
  imageProof?: string;
  isPaid?: boolean;
  citizenId?: string;
}

export interface AttendanceRecord {
  workerId: string;
  name: string;
  status: 'Present' | 'Absent' | 'Medical Leave';
}

export interface DailyAttendance {
  teamId: string;
  date: string;
  records: AttendanceRecord[];
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
  teams: Team[];
  attendance: Record<string, DailyAttendance>;
  language: AppLanguage | null;
  notifications: Notification[];
  sensors: Record<string, any>;
  isDemoRunning: boolean;
  demoStep: number;
  
  setCurrentUser: (user: User | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  
  addTeam: (team: Team) => void;
  addTeamMember: (teamId: string, member: TeamMember) => void;
  updateTeamMember: (teamId: string, workerId: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (teamId: string, workerId: string) => void;

  submitAttendance: (teamId: string, date: string, records: AttendanceRecord[]) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  markNotificationRead: (id: string) => void;
  setDemoState: (running: boolean, step?: number) => void;
  updateSensors: (newSensors: any) => void;
  checkTaskTimeouts: () => void;
  resetToDataset: () => void;
  runSmartAutomation: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      tasks: (initialData.tasks as any[]),
      users: (initialData.users as User[]),
      teams: (initialData.teams as Team[]),
      attendance: {},
      language: null,
      notifications: [],
      isDemoRunning: false,
      demoStep: 0,
      sensors: initialData.sensors,

      setCurrentUser: (user) => set({ currentUser: user }),
      setLanguage: (lang) => set({ language: lang }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (userId, updates) => set((state) => {
        const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...updates } : u);
        const currentUser = state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser;
        return { users: updatedUsers, currentUser };
      }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) => set((state) => {
        const updatedTasks = state.tasks.map(t => {
          if (t.id === taskId) {
            const newTask = { ...t, ...updates };
            if (updates.status === 'completed' && t.status !== 'completed' && t.assignedTo) {
              const points = 25;
              const worker = state.users.find(u => u.id === t.assignedTo);
              if (worker) {
                const updatedUsers = state.users.map(u => u.id === worker.id ? { ...u, rewardPoints: u.rewardPoints + points } : u);
                setTimeout(() => set({ users: updatedUsers }), 0);
              }
            }
            return newTask;
          }
          return t;
        });
        return { tasks: updatedTasks };
      }),
      
      addTeam: (team) => set((state) => {
        const teamId = team.id.toUpperCase().trim();
        const exists = state.teams.find(t => t.id === teamId);
        if (exists) return state; 
        return { teams: [...state.teams, { ...team, id: teamId }] };
      }),
      addTeamMember: (teamId, member) => set((state) => ({
        teams: state.teams.map(t => t.id.toUpperCase() === teamId.toUpperCase().trim() 
          ? { ...t, members: [...t.members, member] } 
          : t)
      })),
      updateTeamMember: (teamId, workerId, updates) => set((state) => ({
        teams: state.teams.map(t => t.id.toUpperCase() === teamId.toUpperCase().trim() ? {
          ...t,
          members: t.members.map(m => m.workerId === workerId ? { ...m, ...updates } : m)
        } : t)
      })),
      removeTeamMember: (teamId, workerId) => set((state) => ({
        teams: state.teams.map(t => t.id.toUpperCase() === teamId.toUpperCase().trim() ? {
          ...t,
          members: t.members.filter(m => m.workerId !== workerId)
        } : t)
      })),

      submitAttendance: (teamId, date, records) => set((state) => ({
        attendance: {
          ...state.attendance,
          [`${teamId}-${date}`]: { teamId, date, records }
        }
      })),
      addNotification: (notif) => set((state) => ({
        notifications: [{
          ...notif,
          id: `notif-${Date.now()}`,
          time: new Date().toISOString(),
          read: false
        }, ...state.notifications].slice(0, 50)
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      setDemoState: (running, step = 0) => set({ isDemoRunning: running, demoStep: step }),
      updateSensors: (newSensors) => set({ sensors: newSensors }),
      checkTaskTimeouts: () => set((state) => {
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        let changed = false;
        
        const updatedTasks = state.tasks.map(t => {
          if (t.status === 'assigned' && t.assignedAt) {
            const assignedTime = new Date(t.assignedAt).getTime();
            if (now - assignedTime > thirtyMinutes) {
              changed = true;
              return { ...t, status: 'pending', assignedTo: undefined, assignedAt: undefined, teamId: undefined };
            }
          }
          return t;
        });
        
        if (!changed) return state;
        return { tasks: updatedTasks };
      }),
      runSmartAutomation: () => {
        const state = get();
        const zones = Object.keys(state.sensors);
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const currentZoneSensors = { ...state.sensors[randomZone] };

        // Randomly simulate sensor fluctuations
        currentZoneSensors.dustbin = Math.min(100, currentZoneSensors.dustbin + Math.floor(Math.random() * 15));
        currentZoneSensors.toilet_napkins = Math.max(0, currentZoneSensors.toilet_napkins - Math.floor(Math.random() * 10));
        
        if (Math.random() > 0.8) currentZoneSensors.drainage = 'leakage';

        const updatedSensors = { ...state.sensors, [randomZone]: currentZoneSensors };
        set({ sensors: updatedSensors });

        // Trigger tasks if thresholds are hit
        if (currentZoneSensors.dustbin > 90 || currentZoneSensors.toilet_napkins < 15 || currentZoneSensors.drainage !== 'ok') {
          const workType = currentZoneSensors.dustbin > 90 ? 'Overflowing Dustbin' : 
                           currentZoneSensors.drainage !== 'ok' ? 'Drainage Leakage' : 'Napkin Refill';
          
          const newTaskId = `smart-task-${Date.now()}`;
          const newTask: Task = {
            id: newTaskId,
            work: `Smart Alert: ${workType}`,
            place: `Junction ${randomZone}-Smart-Alert`,
            status: 'pending',
            source: 'sensor',
            zone: randomZone,
            priority: 'HIGH',
            createdAt: new Date().toISOString()
          };

          // Find best available team in that zone (least active tasks)
          const zoneWorkers = state.users.filter(u => u.role === 'worker' && u.zone === randomZone);
          if (zoneWorkers.length > 0) {
            const workerStats = zoneWorkers.map(w => ({
              ...w,
              activeCount: state.tasks.filter(t => t.assignedTo === w.id && t.status !== 'completed').length
            })).sort((a, b) => a.activeCount - b.activeCount);

            const bestWorker = workerStats[0];
            newTask.status = 'assigned';
            newTask.assignedTo = bestWorker.id;
            newTask.teamId = bestWorker.teamId;
            newTask.assignedAt = new Date().toISOString();

            state.addNotification({
              title: "Smart AI Auto-Dispatch",
              message: `Predictive task for Zone ${randomZone} automatically assigned to Team ${bestWorker.teamId}.`,
              type: 'success'
            });
          }

          state.addTask(newTask);
        }
      },
      resetToDataset: () => set({ 
        tasks: (initialData.tasks as any[]), 
        users: (initialData.users as User[]),
        teams: (initialData.teams as Team[]),
        attendance: {},
        currentUser: null,
        language: null,
        notifications: [],
        sensors: initialData.sensors,
        isDemoRunning: false
      })
    }),
    {
      name: 'clean-madurai-v4-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
