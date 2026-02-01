import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // user: ,
    userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null
}
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload))
            console.log(action.payload)
            localStorage.setItem('token', action.payload.token)
        },
        login: (state, action) => {

        },
        logout: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo')
            localStorage.removeItem('token')



        },

    }
})
export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer