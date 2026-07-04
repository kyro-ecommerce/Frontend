// useAuth.js sau khi tối ưu
import { useDispatch, useSelector } from "react-redux";
import { register, login, getUser, logout } from "../State/Auth/Action"; // getUser vẫn cần nếu muốn refresh thủ công

export const useAuth = () => {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);

    // useEffect để lấy user ban đầu đã được chuyển ra AppInitializer

    return {
        user: auth.user,
        loading: auth.isLoading,
        error: auth.error,
        isAuthenticated: !!auth.user, // hoặc !!auth.jwt nếu bạn muốn dựa vào token
        login: (userData) => dispatch(login(userData)),
        register: (userData) => dispatch(register(userData)),
        // getUser: () => dispatch(getUser()), // Có thể giữ lại nếu cần gọi getUser thủ công
        logout: () => dispatch(logout())
    };
};