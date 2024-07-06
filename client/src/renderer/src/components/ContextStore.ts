//This file will contain user context and state.
import { createContext } from 'react';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }
  
interface UserContextType {
    user: User | null;
    isLogged: boolean;
    comPort: string;
    baudRate: number;
    //array of good types that are added to containers
    goodsType: string[];
    apiUrl: string;
    //set user as user or null
    setUser: (user: User | null) => void;
    setIsLogged: (isLogged: boolean) => void;
    setComPort: (comPort: string) => void;
    setBaudRate: (baudRate: number) => void;
    setGoodsType: (goodsType: string[]) => void;
}

// Create the context with a default value
export const UserContext = createContext<UserContextType>({
    user: null,
    isLogged: false,
    comPort: 'COM5',
    baudRate: 1200,
    goodsType: ["Item A", "Item B"],
    apiUrl: "",
    setUser: () => {},
    setIsLogged: () => {},
    setComPort: () => {},
    setBaudRate: () => {},
    setGoodsType: () => {}
});