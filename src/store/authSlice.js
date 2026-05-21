import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    status: false,
    userData: null,
    userSession: null,      // regular user session
    doctorSession: null,    // doctor session
    currentRole: null       // 'user' or 'doctor' - which one is currently active
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const { userData, role } = action.payload;
            if (role === 'doctor') {
                state.doctorSession = userData;
                state.currentRole = 'doctor';
            } else {
                state.userSession = userData;
                state.currentRole = 'user';
            }
            state.userData = userData;
            state.status = true;
        },
        logout: (state, action) => {
            const role = action.payload?.role;
            if (role === 'doctor') {
                state.doctorSession = null;
                if (state.currentRole === 'doctor') {
                    state.currentRole = state.userSession ? 'user' : null;
                    state.userData = state.userSession;
                    state.status = !!state.userSession;
                }
            } else {
                state.userSession = null;
                if (state.currentRole === 'user') {
                    state.currentRole = state.doctorSession ? 'doctor' : null;
                    state.userData = state.doctorSession;
                    state.status = !!state.doctorSession;
                }
            }

            if (!state.userSession && !state.doctorSession) {
                state.currentRole = null;
                state.userData = null;
                state.status = false;
            }
        },
        logoutAll: (state) => {
            state.status = false;
            state.userData = null;
            state.userSession = null;
            state.doctorSession = null;
            state.currentRole = null;
        },
        switchRole: (state, action) => {
            const toRole = action.payload; // 'user' or 'doctor'
            if (toRole === 'doctor' && state.doctorSession) {
                state.currentRole = 'doctor';
                state.userData = state.doctorSession;
                state.status = true;
            } else if (toRole === 'user' && state.userSession) {
                state.currentRole = 'user';
                state.userData = state.userSession;
                state.status = true;
            }
        }
    }
})

export const { login, logout, logoutAll, switchRole } = authSlice.actions;

export default authSlice.reducer;

