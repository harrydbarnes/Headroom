import {createContext,useContext} from 'react';
export const InterfaceVisible=createContext(true);
export const useInterfaceVisible=()=>useContext(InterfaceVisible);
export const CoverWorkspace=createContext<(()=>void)|null>(null);
