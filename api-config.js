// Configuración de endpoints de los microservicios
const API_CONFIG = {
    MS_INGRESO: 'http://localhost:8000',
    MS_CONCESIONARIOS: 'http://localhost:8001',
    MS_REPORTES: 'http://localhost:8002'
};

// Funciones para conectar con ms-ingreso
const AuthAPI = {
    async login(correo, contrasena) {
        const response = await fetch(`${API_CONFIG.MS_INGRESO}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        return response.json();
    },

    async registerUNAM(correo, contrasena) {
        const response = await fetch(`${API_CONFIG.MS_INGRESO}/auth/register/unam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        return response.json();
    },

    async registerExterno(correo, contrasena) {
        const response = await fetch(`${API_CONFIG.MS_INGRESO}/auth/register/externo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        return response.json();
    }
};

// Funciones para conectar con ms-concesionarios
const ConcesionariaAPI = {
    async obtenerPorQR(numAutorizado) {
        const response = await fetch(`${API_CONFIG.MS_CONCESIONARIOS}/concesionarias/qr/${numAutorizado}`);
        return response.json();
    },

    async crear(concesionaria) {
        const response = await fetch(`${API_CONFIG.MS_CONCESIONARIOS}/concesionarias/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(concesionaria)
        });
        return response.json();
    },

    async obtenerTodas() {
        const response = await fetch(`${API_CONFIG.MS_CONCESIONARIOS}/concesionarias/todas`);
        return response.json();
    }
};