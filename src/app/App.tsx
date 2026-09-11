import { useState, useRef, useEffect } from "react";
import { ProductImage } from "./components/ProductImage";
import { ProductPhotoPicker } from "./components/ProductPhotoPicker";
import {
  Heart, ShoppingBag, Users, Book, Shirt, Baby,
  Footprints, Gamepad2, Watch, Search, Filter, Phone,
  Mail, MapPin, Facebook, Instagram, MessageCircle,
  ChevronRight, Check, Award, Clock, Package,
  TrendingUp, BarChart3, Edit, Trash2, Plus, X, Menu,
  Home as HomeIcon, Info, ArrowRight,
  CheckCircle2, User, LogOut, LogIn, UserPlus, Eye, EyeOff,
  ChevronDown, Lock, Calendar, AlertCircle,
  ShoppingCart, Minus, Receipt, Shield
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { toast, Toaster } from "sonner";
const API_URL = import.meta.env.VITE_API_URL || "";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen =
  | "home" | "catalog" | "product-detail"
  | "confirm-reservation" | "confirmation"
  | "cart" | "checkout" | "order-confirmation"
  | "about" | "contact"
  | "login" | "register" | "password-recovery"
  | "profile" | "my-reservations" | "purchase-history"
  | "admin-login" | "admin";

type ProductStatus = "disponivel" | "reservado" | "vendido" | "indisponivel";
type Category = "Feminino" | "Masculino" | "Infantil" | "Calçados" | "Livros" | "Brinquedos" | "Acessórios";
type AdminTabType = "dashboard" | "users" | "products" | "categories" | "reservations" | "reports" | "whatsapp";
type ReservationStatus = "Pendente" | "Reservada" | "Aguardando Confirmação" | "Confirmada" | "Finalizada" | "Cancelada";
type OrderStatus = "Pendente" | "Reservada" | "Confirmada" | "Finalizada" | "Cancelada";

interface Product {
  id: number; nome: string; categoria: Category;
  descricao: string; condicao: string; preco: number;
  status: ProductStatus; quantidade?: number; imagem: string; imagens?: string[];}

function productAvailability(product: Product): ProductStatus {
  return product.status === "disponivel" && product.quantidade != null && product.quantidade <= 0
    ? "indisponivel" : product.status;
}
interface CartItem { product: Product; quantity: number; }
interface Order {
  id: number;
  items: CartItem[];
  date: string;
  total: number;
  status: OrderStatus;
  cliente?: string;
  usuarioId?: number;
  formaPagamento?: string;
  origem?: "compra" | "reserva";
}
interface UserType {
  id: number; name: string; birthDate: string; email: string;
  phone: string; address: string; city: string; state: string; cep: string;
}
interface UserReservation { id: number; product: Product; date: string; status: ReservationStatus; }
interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: "Ativo" | "Inativo";
  tipo: "usuario" | "vendedor" | "admin";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["Feminino","Masculino","Infantil","Calçados","Livros","Brinquedos","Acessórios"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const sampleProducts: Product[] = [
  {
    id: 1,
    nome: "Vestido Floral Feminino",
    categoria: "Feminino",
    descricao: "Lindo vestido floral em tecido leve e confortável, perfeito para o verão.",
    condicao: "Seminovo - Ótimo estado",
    preco: 35,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop"
  },
  {
    id: 2,
    nome: "Camisa Social Masculina",
    categoria: "Masculino",
    descricao: "Camisa social azul claro, ideal para trabalho e eventos formais.",
    condicao: "Seminovo - Excelente estado",
    preco: 28,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop"
  },
  {
    id: 3,
    nome: "Conjunto Infantil Colorido",
    categoria: "Infantil",
    descricao: "Conjunto infantil com blusa e calça, tamanho 6 anos.",
    condicao: "Novo com etiqueta",
    preco: 25,
    status: "reservado",
    imagem: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop"
  },
  {
    id: 4,
    nome: "Tênis Esportivo Nike",
    categoria: "Calçados",
    descricao: "Tênis Nike em excelente estado, numeração 40.",
    condicao: "Seminovo - Pouco uso",
    preco: 65,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop"
  },
  {
    id: 5,
    nome: "O Pequeno Príncipe",
    categoria: "Livros",
    descricao: "Livro clássico em ótimo estado de conservação.",
    condicao: "Seminovo - Muito bom",
    preco: 15,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop"
  },
  {
    id: 6,
    nome: "Quebra-cabeça 500 Peças",
    categoria: "Brinquedos",
    descricao: "Quebra-cabeça completo com todas as peças.",
    condicao: "Seminovo - Completo",
    preco: 20,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&h=500&fit=crop"
  },
  {
    id: 7,
    nome: "Bolsa Feminina Couro",
    categoria: "Acessórios",
    descricao: "Bolsa de couro sintético em excelente estado.",
    condicao: "Seminovo - Ótimo",
    preco: 40,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop"
  },
  {
    id: 8,
    nome: "Jaqueta Jeans Feminina",
    categoria: "Feminino",
    descricao: "Jaqueta jeans versátil para diversas ocasiões.",
    condicao: "Seminovo - Bom estado",
    preco: 45,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop"
  }
];
const mockUser: UserType = { id:1, name:"Maria Silva", birthDate:"15/03/1990", email:"maria@email.com", phone:"(11) 98765-4321", address:"Rua das Flores, 456", city:"São Paulo", state:"SP", cep:"01234-567" };

const initOrders: Order[] = [
  { id:1, items:[{product:sampleProducts[0],quantity:1},{product:sampleProducts[4],quantity:1}], date:"10/01/2024", total:50, status:"Confirmada" },
  { id:2, items:[{product:sampleProducts[6],quantity:1}], date:"05/01/2024", total:40, status:"Finalizada" },
];

const initAdminUsers: AdminUser[] = [
  { id:1, name:"Maria Silva", email:"maria@email.com", phone:"(11) 98765-4321", registeredAt:"15/01/2024", status:"Ativo" },
  { id:2, name:"João Santos", email:"joao@email.com", phone:"(11) 91234-5678", registeredAt:"10/01/2024", status:"Ativo" },
  { id:3, name:"Ana Paula Costa", email:"ana.paula@email.com", phone:"(11) 99876-5432", registeredAt:"05/01/2024", status:"Ativo" },
  { id:4, name:"Carlos Oliveira", email:"carlos@email.com", phone:"(11) 97654-3210", registeredAt:"28/12/2023", status:"Inativo" },
  { id:5, name:"Fernanda Lima", email:"fernanda@email.com", phone:"(11) 96543-2109", registeredAt:"20/12/2023", status:"Ativo" },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => localStorage.getItem("bazar.lastScreen") === "admin" ? "admin" : "home");
  const [loginReturnTo, setLoginReturnTo] = useState<Screen>("home");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

const refreshProducts = async () => {
  try {
    const response = await fetch(API_URL + "/api/produtos");
    if (!response.ok) throw new Error("Falha ao carregar produtos");
    const dados = await response.json();
    const products = dados.map((p: any) => ({ ...p, quantidade: Number(p.quantidade ?? 0), preco: Number(p.preco), condicao: p.condicao || "", imagem: p.imagem || "" }));
    setAllProducts(products);
    setSelectedProduct(previous => previous ? products.find((p: Product) => p.id === previous.id) || previous : null);
  } catch (error) { console.error("Erro ao carregar produtos:", error); }
};
useEffect(() => { void refreshProducts(); }, []);

useEffect(() => {
  fetch(`${API_URL}/api/configuracoes`)
    .then(res => res.json())
    .then(dados => {
      setWhatsapp(dados.whatsapp || "");
    })
    .catch(error => {
      console.error("Erro ao carregar WhatsApp:", error);
    });
}, []);


  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number,number]>([0,100]);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminRole, setAdminRole] = useState<"admin" | "vendedor" | null>(null);
  useEffect(() => {
    localStorage.setItem("bazar.lastScreen", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let active = true;
    fetch(API_URL + "/api/usuarios/perfil", { headers: { Authorization: "Bearer " + token } })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || "Sessão expirada.");
        if (!active) return;
        const user = data.usuario;
        if (["admin", "vendedor"].includes(user.tipo)) {
          setCurrentUser(null); setIsLoggedIn(false); setAdminRole(user.tipo); setIsAdminLoggedIn(true);
          setAdminTab((localStorage.getItem("bazar.adminTab") as AdminTabType) || "products");
        } else {
          setCurrentUser({ id: user.id, name: user.nome, email: user.email, birthDate: "", phone: user.telefone || "", address: "", city: "", state: "", cep: "" });
          setIsLoggedIn(true); setIsAdminLoggedIn(false); setAdminRole(null);
        }
      })
      .catch(() => { if (active) { localStorage.removeItem("token"); localStorage.removeItem("adminRole"); setCurrentScreen("home"); } });
    return () => { active = false; };
  }, []);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [reservationLoading, setReservationLoading] = useState(true);
  const [reservationError, setReservationError] = useState("");
  const [reservationRefresh, setReservationRefresh] = useState(0);
  const [reservationSaving, setReservationSaving] = useState(false);
  const reservationSavingRef = useRef(false);
  const [lastReservationId, setLastReservationId] = useState<number | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentScreen !== "my-reservations") return;
    const controller = new AbortController();
    setReservationLoading(true);
    setReservationError("");
    const carregar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Entre novamente para consultar suas reservas.");
        const resposta = await fetch(API_URL + "/api/vendas/minhas/reservas", {
          headers: { Authorization: "Bearer " + token }, signal: controller.signal
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Não foi possível carregar as reservas.");
        const reservas: UserReservation[] = dados.map((v: any) => {
          const item = v.itens[0];
          return {
            id: v.id, status: v.status, date: new Date(v.data_venda).toLocaleDateString("pt-BR"),
            product: { id: item.produto_id, nome: item.nome, categoria: item.categoria,
              descricao: item.descricao || "", condicao: item.condicao || "", preco: Number(item.preco_unitario),
              status: item.status, imagem: item.imagem || "" }
          };
        });
        if (!controller.signal.aborted) setUserReservations(reservas);
      } catch (error) {
        if (!controller.signal.aborted) {
          setUserReservations([]);
          setReservationError(error instanceof Error ? error.message : "Não foi possível carregar as reservas.");
        }
      } finally { if (!controller.signal.aborted) setReservationLoading(false); }
    };
    void carregar();
    return () => controller.abort();
  }, [isLoggedIn, currentUser?.id, currentScreen, reservationRefresh]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [purchaseHistory, setPurchaseHistory] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentScreen !== "purchase-history") return;
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError("");
    const carregarHistorico = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Entre novamente para consultar suas compras.");
        const resposta = await fetch(API_URL + "/api/vendas/minhas", {
          headers: { Authorization: "Bearer " + token }, signal: controller.signal
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Não foi possível carregar suas compras.");
              const vendasConvertidas: Order[] = dados.map((v: any) => ({
        id: v.id,
        cliente: v.cliente || "Cliente",
        usuarioId: v.usuario_id,
        origem: v.origem,
        formaPagamento: v.forma_pagamento || "",
        date: v.data_venda
          ? new Date(v.data_venda).toLocaleDateString("pt-BR")
          : "-",
        total: Number(v.valor_total),
        status: v.status as OrderStatus,
        items: (v.itens || []).map((item: any) => ({
          quantity: Number(item.quantidade),
          product: {
            id: item.produto_id,
            nome: item.nome,
            descricao: item.descricao || "",
            categoria: item.categoria,
            condicao: item.condicao || "",
            preco: Number(item.preco_unitario),
            status: item.status,
            imagem: item.imagem || ""
          }
        }))
      }));


        if (!controller.signal.aborted) setPurchaseHistory(vendasConvertidas);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPurchaseHistory([]); setUserReservations([]); setReservationLoading(true);
          setHistoryError(error instanceof Error ? error.message : "Não foi possível carregar suas compras.");
        }
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false);
      }
    };
    void carregarHistorico();
    return () => controller.abort();
  }, [isLoggedIn, currentUser?.id, currentScreen, historyRefresh]);



useEffect(() => {
  if (!isAdminLoggedIn) return;

  const carregarVendas = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const resposta = await fetch(`${API_URL}/api/vendas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        console.error("Erro ao carregar vendas:", dados);
        return;
      }

      const vendasConvertidas: Order[] = dados.map((v: any) => ({
        id: v.id,
        cliente: v.cliente || "Cliente",
        usuarioId: v.usuario_id,
        origem: v.origem,
        formaPagamento: v.forma_pagamento || "",
        date: v.data_venda
          ? new Date(v.data_venda).toLocaleDateString("pt-BR")
          : "-",
        total: Number(v.valor_total),
        status: v.status as OrderStatus,
        items: (v.itens || []).map((item: any) => ({
          quantity: Number(item.quantidade),
          product: {
            id: item.produto_id,
            nome: item.nome,
            descricao: item.descricao || "",
            categoria: item.categoria,
            condicao: item.condicao || "",
            preco: Number(item.preco_unitario),
            status: item.status,
            imagem: item.imagem || ""
          }
        }))
      }));

      setOrders(vendasConvertidas);

    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    }
  };

  carregarVendas();
}, [isAdminLoggedIn]);


  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const submittingOrderRef = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTabType>("dashboard");
  const [whatsapp, setWhatsapp] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  // ─── Computed ───────────────────────────────────────────────────────────────

const filteredProducts = allProducts.filter(p => {
  const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;

  const matchQ =
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase());

  const matchP =
    p.preco >= priceRange[0] &&
    p.preco <= priceRange[1];

  const matchS =
    statusFilter === "all" ||
    productAvailability(p) === statusFilter;

  return matchCat && matchQ && matchP && matchS;
});
  const cartTotal = cart.reduce(
  (s, i) => s + i.product.preco * i.quantity,
  0
);
  const cartCount = cart.reduce((s,i) => s + i.quantity, 0);

  // ─── Handlers ────────────────────────────────────────────────────────────────

const handleLogin = async (email: string, password: string) => {
  try {
    const resposta = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha: password
      })
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || !dados?.token || !dados?.usuario) {
      toast.error(dados.erro || "E-mail ou senha inválidos.");
      return;
    }

    localStorage.setItem("token", dados.token);

    setPurchaseHistory([]); setUserReservations([]); setReservationLoading(true);
    setHistoryLoading(true);
    setIsAdminLoggedIn(false);
    setAdminRole(null);
    setCurrentUser({
      id: dados.usuario.id,
      name: dados.usuario.nome,
      email: dados.usuario.email,
      birthDate: "",
      phone: dados.usuario.telefone || "",
      address: "",
      city: "",
      state: "",
      cep: ""
    });

    setIsLoggedIn(true);

    const dest =
      loginReturnTo === "login" ? "home" : loginReturnTo;

    setLoginReturnTo("home");
    setCurrentScreen(dest);

    toast.success("Login realizado com sucesso!");

  } catch (error) {
    console.error("Erro no login:", error);
    toast.error("Não foi possível realizar o login.");
  }
};


  const handleLogout = () => { localStorage.removeItem("token"); setPurchaseHistory([]); setUserReservations([]); setReservationLoading(true); setOrders([]); setIsLoggedIn(false); setCurrentUser(null); setUserMenuOpen(false); setCurrentScreen("home"); };

const handleAdminLogin = async (email: string, password: string) => {
  try {
      const resposta = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha: password
      })
    });

    const dados = await resposta.json().catch(() => ({}));

    if (
  !resposta.ok || !dados?.token || !dados?.usuario ||
  !["admin", "vendedor"].includes(dados.usuario.tipo)
) {
  return false;
}

localStorage.setItem("token", dados.token);
localStorage.setItem("adminRole", dados.usuario.tipo);

setCurrentUser(null);
setIsLoggedIn(false);
setPurchaseHistory([]); setUserReservations([]); setReservationLoading(true);
setAdminRole(dados.usuario.tipo);
setIsAdminLoggedIn(true);
setAdminTab("dashboard");
setCurrentScreen("admin");

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return false;
  }
};

const handleAdminLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminRole");
  setAdminRole(null);
  setAdminTab("dashboard");
  setIsAdminLoggedIn(false);
  setCurrentScreen("home");
};
  const addToCart = (product: Product) => {
  if (productAvailability(product) !== "disponivel") {
    toast.error("Produto indisponível ou sem estoque.");
    return;
  }

  setCart(prev => {
    if (prev.find(i => i.product.id === product.id)) {
      toast.info(`${product.nome} já está no carrinho!`);
      return prev;
    }

    toast.success(`${product.nome} adicionado!`, {
      descricao: `R$ ${product.preco.toFixed(2)}`
    });

    return [...prev, { product, quantity: 1 }];
  });
};

  const removeFromCart = (id: number) => setCart(p => p.filter(i => i.product.id !== id));

  const updateQty = (id: number, delta: number) => setCart(p => p.map(i => i.product.id === id ? {...i, quantity: Math.max(1, Math.min(5, i.quantity+delta))} : i));

  const handleReserveClick = () => {
    if (!selectedProduct || productAvailability(selectedProduct) !== "disponivel") {
      toast.error("Produto indisponível ou sem estoque.");
      return;
    }
    if (!isLoggedIn) { setLoginReturnTo("confirm-reservation"); setCurrentScreen("login"); }
    else setCurrentScreen("confirm-reservation");
  };

  const handleCartCheckout = () => {
    if (!isLoggedIn) { setLoginReturnTo("checkout"); setCurrentScreen("login"); }
    else setCurrentScreen("checkout");
  };

  const handleConfirmReservation = async () => {
    if (!selectedProduct || !currentUser || reservationSavingRef.current) return;
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Entre novamente para reservar."); return; }
    reservationSavingRef.current = true;
    setReservationSaving(true);
    try {
      const resposta = await fetch(API_URL + "/api/vendas/reservas", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ itens: [{ produto_id: selectedProduct.id, quantidade: 1 }] })
      });
      const dados = await resposta.json();
      if (!resposta.ok) { toast.error(dados.erro || "Não foi possível reservar."); void refreshProducts(); return; }
      void refreshProducts();
      setLastReservationId(dados.venda.id);
      setCurrentScreen("confirmation");
    } catch {
      toast.error("Não foi possível confirmar o resultado. Consulte Minhas Reservas antes de tentar novamente.");
    } finally { reservationSavingRef.current = false; setReservationSaving(false); }
  };

  const handleConfirmOrder = async () => {
    if (!currentUser || cart.length === 0 || submittingOrderRef.current) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Entre novamente na sua conta para confirmar a compra.");
      return;
    }

    submittingOrderRef.current = true;
    setIsSubmittingOrder(true);
    const itensPedido = cart.map(item => ({ ...item }));
    try {
      const resposta = await fetch(`${API_URL}/api/vendas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          forma_pagamento: null,
          itens: itensPedido.map(item => ({
            produto_id: item.product.id,
            quantidade: item.quantity
          }))
        })
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        toast.error(dados.erro || "Não foi possível registrar a compra.");
        return;
      }

      void refreshProducts();
      const venda = dados.venda;
      setOrders(prev => [{
        id: venda.id,
        items: itensPedido,
        date: new Date(venda.data_venda).toLocaleDateString("pt-BR"),
        total: Number(venda.valor_total),
        status: venda.status,
        usuarioId: venda.usuario_id,
        cliente: currentUser.name,
        formaPagamento: venda.forma_pagamento || ""
      }, ...prev]);
      setCart([]);
      setCurrentScreen("order-confirmation");
      toast.success(`Pedido nº ${venda.id} registrado com sucesso!`);
    } catch (error) {
      console.error("Erro ao registrar compra:", error);
      toast.error("Não foi possível confirmar o resultado da compra. Confira seus pedidos com a Casa Azul antes de tentar novamente.");
    } finally {
      submittingOrderRef.current = false;
      setIsSubmittingOrder(false);
    }
  };

  // ─── Shared Components ─────────────────────────────────────────────────────

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-border z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => { setCurrentScreen("home"); setMobileMenuOpen(false); setUserMenuOpen(false); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"><Heart className="w-6 h-6 text-white fill-white" /></div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-primary" style={{fontFamily:"Poppins,sans-serif"}}>Casa Azul</div>
              <div className="text-xs text-muted-foreground -mt-1">Bazar Solidário</div>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-6">
            {[["home","Início"],["catalog","Catálogo"],["about","Sobre"],["contact","Contato"]].map(([s,l]) => (
              <button key={s} onClick={() => setCurrentScreen(s as Screen)} className="text-foreground hover:text-primary transition-colors font-medium">{l}</button>
            ))}
            <button onClick={() => setCurrentScreen("cart")} className="relative p-2 hover:bg-accent rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button onClick={() => { setLoginReturnTo("home"); setCurrentScreen("login"); }} className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Entrar
                </button>
                <button onClick={() => setCurrentScreen("register")} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Criar Conta
                </button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl hover:bg-accent/80 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                  <span className="font-medium text-primary text-sm">{currentUser?.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${userMenuOpen?"rotate-180":""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-border"><p className="text-sm font-semibold">{currentUser?.name}</p><p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p></div>
                    <div className="p-2 space-y-0.5">
                      {[{l:"Meu Perfil",s:"profile" as Screen,I:User},{l:"Minhas Reservas",s:"my-reservations" as Screen,I:Package},{l:"Histórico de Compras",s:"purchase-history" as Screen,I:Receipt}].map(({l,s,I}) => (
                        <button key={s} onClick={() => { setCurrentScreen(s); setUserMenuOpen(false); }} className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-left">
                          <I className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{l}</span>
                        </button>
                      ))}
                      <div className="border-t border-border my-1" />
                      <button onClick={handleLogout} className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4 text-red-500" /><span className="text-sm font-medium text-red-500">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setCurrentScreen("cart")} className="relative p-2 hover:bg-accent rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t border-border">
            {[["home","Início"],["catalog","Catálogo"],["about","Sobre"],["contact","Contato"]].map(([s,l]) => (
              <button key={s} onClick={() => { setCurrentScreen(s as Screen); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-muted rounded-lg font-medium">{l}</button>
            ))}
            <div className="border-t border-border pt-3 mt-3 space-y-1">
              {!isLoggedIn ? (
                <>
                  <button onClick={() => { setLoginReturnTo("home"); setCurrentScreen("login"); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-muted rounded-lg font-medium flex items-center gap-2"><LogIn className="w-4 h-4 text-primary" /> Entrar</button>
                  <button onClick={() => { setCurrentScreen("register"); setMobileMenuOpen(false); }} className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium flex items-center gap-2 justify-center"><UserPlus className="w-4 h-4" /> Criar Conta</button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 bg-accent rounded-xl mb-2"><p className="font-semibold text-primary">{currentUser?.name}</p><p className="text-xs text-muted-foreground">{currentUser?.email}</p></div>
                  {[["profile","Meu Perfil"],["my-reservations","Minhas Reservas"],["purchase-history","Histórico de Compras"]].map(([s,l]) => (
                    <button key={s} onClick={() => { setCurrentScreen(s as Screen); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-muted rounded-lg font-medium">{l}</button>
                  ))}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 hover:bg-red-50 rounded-lg text-red-500 font-medium flex items-center gap-2"><LogOut className="w-4 h-4" /> Sair</button>
                </>
              )}
              <div className="border-t border-border pt-3 mt-3">
                <button onClick={() => { setCurrentScreen("admin-login"); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-muted rounded-lg font-medium text-muted-foreground flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" /> Área Administrativa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="bg-[#163E8F] text-white py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center"><Heart className="w-6 h-6 text-primary fill-primary" /></div>
              <div><div className="font-bold text-lg" style={{fontFamily:"Poppins,sans-serif"}}>Casa Azul</div><div className="text-sm opacity-80">Bazar Solidário</div></div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">Transformando vidas através da solidariedade e do amor ao próximo.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3"><MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" /><span className="text-sm opacity-90">Rua da Esperança, 123<br />Centro - São Paulo, SP</span></div>
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 flex-shrink-0" /><span className="text-sm opacity-90">(11) 98765-4321</span></div>
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 flex-shrink-0" /><span className="text-sm opacity-90">contato@casaazul.org</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Links Rápidos</h4>
            <div className="space-y-2">
              {[["home","Início"],["catalog","Catálogo"],["about","Sobre"],["contact","Contato"]].map(([s,l]) => (
                <button key={s} onClick={() => setCurrentScreen(s as Screen)} className="block text-sm opacity-90 hover:opacity-100 hover:underline transition-all">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              {[Facebook, Instagram, MessageCircle].map((Icon,i) => (
                <button key={i} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon className="w-5 h-5" /></button>
              ))}
            </div>
            <div className="border-t border-white/20 pt-4">
              <button onClick={() => setCurrentScreen("admin-login")} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-xs">
                <Shield className="w-3.5 h-3.5" /> Área Administrativa
              </button>
              <button onClick={() => setCurrentScreen("db-model")} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs mt-2">
                <BarChart3 className="w-3.5 h-3.5" /> Modelo Físico BD
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm opacity-80">
          © 2024 Casa Azul - Bazar Solidário. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );

  const StatusBadge = ({ status }: { status: ProductStatus }) => {
    const m: Record<ProductStatus,{cls:string;label:string}> = {
      disponivel:{cls:"bg-green-100 text-green-700 border-green-200",label:"Disponível"},
      reservado:{cls:"bg-yellow-100 text-yellow-700 border-yellow-200",label:"Reservado"},
      vendido:{cls:"bg-gray-200 text-gray-600 border-gray-300",label:"Vendido"},
      indisponivel:{cls:"bg-gray-100 text-gray-500 border-gray-200",label:"Indisponível"},
    };
    const {cls,label} = m[status];
    return <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cls}`}>{label}</span>;
  };

function ProductCard({ product }: { product: Product }) {
  const statusMap = {
    disponivel: {
      cls: "bg-green-100 text-green-700 border-green-200",
      label: "Disponível"
    },
    reservado: {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      label: "Reservado"
    },
    vendido: {
      cls: "bg-gray-200 text-gray-600 border-gray-300",
      label: "Vendido"
    },
    indisponivel: {
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      label: "Indisponível"
    }
  };

  const canAdd = productAvailability(product) === "disponivel";
  const openDetails = () => {
    setSelectedProduct(product);
    setCurrentScreen("product-detail");
  };

  return (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all">
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <ProductImage
          src={product.imagem}
          alt={product.nome}

          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
          {product.categoria}
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {product.nome}
        </h3>

        <span className="text-2xl font-bold text-primary block mb-4">
          R$ {product.preco.toFixed(2)}
        </span>

        <StatusBadge status={productAvailability(product)} />

        <button
          type="button"
          onClick={openDetails}
          translate="no"
          className="mt-4 w-full px-3 py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <span>Ver detalhes</span>
        </button>

        <button
          type="button"
          translate="no"
          disabled={!canAdd}
          onClick={() => addToCart(product)}
          className="mt-2 w-full px-3 py-3 rounded-xl font-semibold bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{canAdd ? "Adicionar ao carrinho" : "Produto indisponível"}</span>
        </button>
      </div>
    </article>
  );
}

  // ─── Auth Screens ──────────────────────────────────────────────────────────

  const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<{email?:string;password?:string}>({});

    const validate = () => {
      const e: typeof errors = {};
      if (!email) e.email = "E-mail é obrigatório";
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido";
      if (!password) e.password = "Senha é obrigatória";
      setErrors(e); return !e.email && !e.password;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#163E8F] via-[#1a4aab] to-[#2F5FD0] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button onClick={() => setCurrentScreen("home")} className="inline-flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"><Heart className="w-8 h-8 text-primary fill-primary" /></div>
              <div><div className="text-white font-bold text-2xl" style={{fontFamily:"Poppins,sans-serif"}}>Casa Azul</div><div className="text-white/70 text-sm">Bazar Solidário</div></div>
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-2xl font-bold mb-1" style={{fontFamily:"Poppins,sans-serif"}}>Bem-vindo(a) de volta!</h1>
            <p className="text-muted-foreground text-sm mb-8">Entre na sua conta para continuar</p>
            <form onSubmit={(e) => { e.preventDefault(); if (validate()) handleLogin(email, password); }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className={`w-full pl-11 pr-4 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email?"border-destructive":"border-border"}`} />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Senha</label>
                  <button type="button" onClick={() => setCurrentScreen("password-recovery")} className="text-xs text-primary hover:underline">Esqueci minha senha</button>
                </div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type={show?"text":"password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" className={`w-full pl-11 pr-12 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.password?"border-destructive":"border-border"}`} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
              </div>
              <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg">Entrar</button>
            </form>
            <div className="mt-5 text-center"><span className="text-muted-foreground text-sm">Não tem uma conta? </span><button onClick={() => setCurrentScreen("register")} className="text-primary font-semibold text-sm hover:underline">Criar conta grátis</button></div>
            <div className="mt-4 p-3 bg-accent rounded-xl text-xs text-center text-muted-foreground"><strong className="text-primary">Demo:</strong> use qualquer e-mail e senha válidos</div>

            {/* ADMIN ACCESS — destaque */}
            <div className="mt-5 pt-5 border-t border-border">
              <button onClick={() => setCurrentScreen("admin-login")} className="w-full py-3 flex items-center justify-center gap-2 bg-[#0f2557]/5 hover:bg-[#0f2557]/10 border border-[#163E8F]/20 rounded-xl transition-colors text-[#163E8F] font-medium text-sm">
                <Shield className="w-4 h-4" /> Área Administrativa
              </button>
              <p className="text-center text-xs text-muted-foreground mt-2">Acesso exclusivo para administradores</p>
            </div>
          </div>
          <div className="text-center mt-5">
            <button onClick={() => setCurrentScreen("home")} className="text-white/70 hover:text-white text-sm flex items-center gap-1 mx-auto"><ChevronRight className="w-4 h-4 rotate-180" /> Voltar ao site</button>
          </div>
        </div>
      </div>
    );
  };

  const AdminLoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1a3b] via-[#163E8F] to-[#1a4aab] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"><Shield className="w-8 h-8 text-primary" /></div>
              <div><div className="text-white font-bold text-2xl" style={{fontFamily:"Poppins,sans-serif"}}>Área Administrativa</div><div className="text-white/70 text-sm">Casa Azul — Bazar Solidário</div></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div><p className="font-semibold text-sm text-primary">Acesso Restrito</p><p className="text-xs text-muted-foreground">Apenas administradores autorizados</p></div>
            </div>
            <form onSubmit={async (e) => {
  e.preventDefault();

  const sucesso = await handleAdminLogin(email, password);

  if (!sucesso) {
    setError("E-mail ou senha incorretos.");
  }
}} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">E-mail Administrativo</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@email.com" className={`w-full pl-11 pr-4 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${error?"border-destructive":"border-border"}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type={show?"text":"password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className={`w-full pl-11 pr-12 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${error?"border-destructive":"border-border"}`} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {error && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#163E8F] text-white rounded-xl hover:bg-[#163E8F]/90 font-semibold shadow-lg">Acessar Painel</button>
            </form>
  
            <div className="mt-5 pt-5 border-t border-border text-center">
              <button onClick={() => setCurrentScreen("login")} className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1 mx-auto"><ChevronRight className="w-4 h-4 rotate-180" /> Voltar ao Login de Usuário</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegisterScreen = () => {
    const [form, setForm] = useState({name:"",email:"",phone:"",password:"",confirmPassword:"",acceptTerms:false});
    const [showP, setShowP] = useState(false);
    const [showC, setShowC] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [done, setDone] = useState(false);
    const set = (k: string, v: string|boolean) => setForm(f => ({...f,[k]:v}));

    const validate = () => {
      const e: Record<string,string> = {};
      if (!form.name.trim()) e.name = "Nome é obrigatório";
      if (!form.email.trim()) e.email = "E-mail é obrigatório";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";

      if (!/^[+\d\s().-]+$/.test(form.phone) || form.phone.replace(/\D/g, "").length < 10 || form.phone.replace(/\D/g, "").length > 15) e.phone = "Informe telefone com DDD (10 a 15 dígitos).";
      if (!form.password) e.password = "Senha é obrigatória";
      else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas não coincidem";
      if (!form.acceptTerms) e.acceptTerms = "Aceite os termos";
      setErrors(e); return Object.keys(e).length === 0;
    };

    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const submitRegistration = async () => {
      if (savingRef.current || !validate()) return;
      savingRef.current = true;
      setSaving(true);
      try {
        const response = await fetch(`${API_URL}/api/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: form.name.trim(), email: form.email.trim(), senha: form.password, telefone: form.phone.trim() })
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 409) setErrors(prev => ({ ...prev, email: data.erro }));
          toast.error(data.erro || "Não foi possível criar sua conta.");
          return;
        }
        setDone(true);
      } catch {
        toast.error("Não foi possível confirmar o cadastro. Tente entrar com seu e-mail antes de cadastrar novamente.");
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    };

    if (done) return (
      <div className="min-h-screen bg-gradient-to-br from-[#163E8F] to-[#2F5FD0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold mb-3" style={{fontFamily:"Poppins,sans-serif"}}>Conta criada com sucesso!</h2>
          <p className="text-muted-foreground mb-6">Agora você pode entrar na sua conta.</p>
          <button onClick={() => setCurrentScreen("login")} className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold">Ir para o Login</button>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#163E8F] to-[#2F5FD0] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <button onClick={() => setCurrentScreen("home")} className="inline-flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"><Heart className="w-8 h-8 text-primary fill-primary" /></div>
              <div className="text-white font-bold text-2xl" style={{fontFamily:"Poppins,sans-serif"}}>Casa Azul</div>
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-2xl font-bold mb-1" style={{fontFamily:"Poppins,sans-serif"}}>Criar conta</h1>
            <p className="text-muted-foreground text-sm mb-8">Preencha seus dados para se cadastrar</p>
            <form onSubmit={(e) => { e.preventDefault(); void submitRegistration(); }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input type="text" value={form.name} onChange={e => set("name",e.target.value)} placeholder="Seu nome completo" className={`w-full px-4 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.name?"border-destructive":"border-border"}`} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium mb-2">Telefone / WhatsApp *</label>
                <input id="register-phone" type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={e => set("phone",e.target.value)} placeholder="(11) 99999-9999" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "register-phone-error" : undefined} className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.phone && <p id="register-phone-error" className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-mail *</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={form.email} onChange={e => set("email",e.target.value)} placeholder="seu@email.com" className={`w-full pl-11 pr-4 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email?"border-destructive":"border-border"}`} />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Senha *</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type={showP?"text":"password"} value={form.password} onChange={e => set("password",e.target.value)} placeholder="Mín. 6 caracteres" className={`w-full pl-11 pr-12 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.password?"border-destructive":"border-border"}`} />
                    <button type="button" onClick={() => setShowP(!showP)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showP?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar Senha *</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type={showC?"text":"password"} value={form.confirmPassword} onChange={e => set("confirmPassword",e.target.value)} placeholder="Repita a senha" className={`w-full pl-11 pr-12 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.confirmPassword?"border-destructive":"border-border"}`} />
                    <button type="button" onClick={() => setShowC(!showC)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showC?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms",e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-primary" />
                <span className="text-sm text-muted-foreground">Li e concordo com os <button type="button" className="text-primary hover:underline font-medium">Termos de Uso</button> e <button type="button" className="text-primary hover:underline font-medium">Política de Privacidade</button></span>
              </label>
              {errors.acceptTerms && <p className="text-destructive text-xs">{errors.acceptTerms}</p>}
              <button type="submit" disabled={saving} className="disabled:opacity-60 disabled:cursor-wait w-full py-3.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold shadow-lg">{saving ? "Criando conta..." : "Criar Conta"}</button>
            </form>
            <div className="mt-5 text-center"><span className="text-muted-foreground text-sm">Já possui conta? </span><button onClick={() => setCurrentScreen("login")} className="text-primary font-semibold text-sm hover:underline">Entrar</button></div>
          </div>
        </div>
      </div>
    );
  };

  const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#163E8F] to-[#2F5FD0] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8"><button onClick={() => setCurrentScreen("home")} className="inline-flex flex-col items-center gap-3"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"><Heart className="w-8 h-8 text-primary fill-primary" /></div></button></div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {!sent ? (
              <>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5"><Lock className="w-7 h-7 text-primary" /></div>
                <h1 className="text-2xl font-bold mb-1" style={{fontFamily:"Poppins,sans-serif"}}>Recuperar senha</h1>
                <p className="text-muted-foreground text-sm mb-6">Digite seu e-mail para receber o link de recuperação.</p>
                <form onSubmit={(e) => { e.preventDefault(); if (!email) { setError("E-mail é obrigatório"); return; } if (!/\S+@\S+\.\S+/.test(email)) { setError("E-mail inválido"); return; } setSent(true); }} className="space-y-4">
                  <div><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="seu@email.com" className={`w-full pl-11 pr-4 py-3 bg-muted rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${error?"border-destructive":"border-border"}`} /></div>
                    {error && <p className="text-destructive text-xs mt-1">{error}</p>}
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold">Enviar Link</button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                <h2 className="text-xl font-bold mb-2" style={{fontFamily:"Poppins,sans-serif"}}>Link enviado!</h2>
                <p className="text-muted-foreground text-sm">Verifique seu e-mail: <strong className="text-foreground">{email}</strong></p>
              </div>
            )}
            <div className="mt-5 text-center"><button onClick={() => setCurrentScreen("login")} className="text-primary text-sm hover:underline flex items-center justify-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" /> Voltar ao login</button></div>
          </div>
        </div>
      </div>
    );
  };

  // ─── User Screens ──────────────────────────────────────────────────────────

  const ProfileScreen = () => {
    if (!currentUser) return <LoginScreen />;
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="mb-8"><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Meu Perfil</h1><p className="text-muted-foreground mt-1">Informações da sua conta</p></div>
          <div className="bg-gradient-to-r from-[#163E8F] to-[#2F5FD0] rounded-2xl p-8 mb-6 text-white">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"><User className="w-10 h-10 text-white" /></div>
              <div><h2 className="text-2xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>{currentUser.name}</h2><p className="text-white/80 text-sm">{currentUser.email}</p><span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Membro Ativo</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8 mb-6">
            <h3 className="font-semibold text-lg mb-5">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{l:"Nome",v:currentUser.name},{l:"Data de Nascimento",v:currentUser.birthDate},{l:"E-mail",v:currentUser.email},{l:"Telefone",v:currentUser.phone},{l:"Endereço",v:currentUser.address||"—"},{l:"Cidade / Estado",v:currentUser.city?`${currentUser.city} / ${currentUser.state}`:"—"}].map((f,i)=>(
                <div key={i} className="p-4 bg-muted rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{f.l}</p><p className="font-medium text-sm">{f.v}</p></div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Editar Perfil</button>
            <button onClick={() => setCurrentScreen("purchase-history")} className="flex-1 py-3 bg-accent text-primary rounded-xl hover:bg-accent/80 font-medium flex items-center justify-center gap-2"><Receipt className="w-4 h-4" /> Histórico</button>
          </div>
        </div></div>
        <Footer />
      </div>
    );
  };

  const MyReservationsScreen = () => {
    if (!currentUser) return <LoginScreen />;
    const statusCls: Record<string,string> = {
      "Reservada":"bg-yellow-100 text-yellow-700 border-yellow-200",
      "Pendente":"bg-yellow-100 text-yellow-700 border-yellow-200",
      "Aguardando Confirmação":"bg-yellow-100 text-yellow-700 border-yellow-200",
      "Confirmada":"bg-blue-100 text-blue-700 border-blue-200",
      "Finalizada":"bg-green-100 text-green-700 border-green-200",
      "Cancelada":"bg-gray-100 text-gray-600 border-gray-200",
    };
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Minhas Reservas</h1><p className="text-muted-foreground mt-1">{reservationLoading ? "Carregando..." : reservationError ? "Reservas indisponíveis" : userReservations.length + " reserva(s)"}</p></div>
            <button onClick={() => setCurrentScreen("catalog")} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium flex items-center gap-2 self-start"><Plus className="w-4 h-4" /> Nova Reserva</button>
          </div>
          {reservationLoading ? <p role="status" className="p-8 text-center">Carregando reservas...</p> : reservationError ? (
            <div className="p-8 text-center"><p role="alert">{reservationError}</p><button onClick={() => setReservationRefresh(value => value + 1)} className="mt-4 px-5 py-3 rounded-xl bg-primary text-white">Tentar novamente</button></div>
          ) : userReservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma reserva</h3>
              <button onClick={() => setCurrentScreen("catalog")} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium">Explorar Produtos</button>
            </div>
          ) : (
            <div className="space-y-4">
              {userReservations.map(res => (
                <div key={res.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md cursor-pointer" onClick={() => { setSelectedProduct(res.product); setCurrentScreen("product-detail"); }}>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0"><ProductImage src={res.product.imagem} alt={res.product.nome} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div><p className="text-sm text-muted-foreground">Reserva nº {res.id}</p><h3 className="font-semibold text-lg">{res.product.nome}</h3><p className="text-muted-foreground text-sm">{res.product.categoria}</p>
                          <div className="flex items-center gap-4 mt-2"><span className="text-xl font-bold text-primary">R$ {res.product.preco.toFixed(2)}</span><span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{res.date}</span></div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 self-start ${statusCls[res.status]||statusCls["Confirmada"]}`}>{res.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div></div>
        <Footer />
      </div>
    );
  };

  const PurchaseHistoryScreen = () => {
    if (!currentUser) return <LoginScreen />;
    const [selected, setSelected] = useState<Order|null>(null);
    const statusCls: Record<OrderStatus,string> = {
      "Pendente":"bg-yellow-100 text-yellow-700 border-yellow-200",
      "Reservada":"bg-blue-100 text-blue-700 border-blue-200",
      "Confirmada":"bg-indigo-100 text-indigo-700 border-indigo-200",
      "Finalizada":"bg-green-100 text-green-700 border-green-200",
      "Cancelada":"bg-gray-100 text-gray-600 border-gray-200",
    };

    if (selected) return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <button onClick={() => setSelected(null)} className="mb-8 text-muted-foreground hover:text-foreground flex items-center gap-2 font-medium"><ChevronRight className="w-5 h-5 rotate-180" /> Voltar ao Histórico</button>
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#163E8F] to-[#2F5FD0] p-6 text-white">
              <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Pedido #{selected.id}</h2><p className="text-white/80 text-sm mt-1">{selected.date}</p></div>
                <span className="px-3 py-1.5 bg-white/20 border border-white/30 rounded-full text-xs font-semibold">{selected.status}</span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Produtos</h3>
                <div className="space-y-3">{selected.items.map((item,i)=>(
                  <div key={i} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"><ProductImage src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-cover" /></div>
                    <div className="flex-1"><p className="font-medium">{item.product.nome}</p><p className="text-sm text-muted-foreground">{item.product.categoria}</p></div>
                    <div className="text-right"><p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p><p className="font-bold text-primary">R$ {(item.product.preco*item.quantity).toFixed(2)}</p></div>
                  </div>
                ))}</div>
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="font-semibold text-lg">Total</span><span className="text-2xl font-bold text-primary">R$ {selected.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div></div>
        <Footer />
      </div>
    );

    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Histórico de Compras</h1><p className="text-muted-foreground mt-1">{historyLoading ? "Carregando..." : historyError ? "Histórico indisponível" : `${purchaseHistory.length} pedido(s) realizados`}</p></div>
            <button onClick={() => setCurrentScreen("catalog")} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium flex items-center gap-2 self-start"><ShoppingBag className="w-4 h-4" /> Nova compra</button>
          </div>
          {historyLoading ? (
            <p role="status" className="p-8 text-center">Carregando suas compras...</p>
          ) : historyError ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-border"><p role="alert">{historyError}</p><button onClick={() => setHistoryRefresh(value => value + 1)} className="mt-4 px-5 py-3 rounded-xl bg-primary text-white">Tentar novamente</button></div>
          ) : purchaseHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center"><Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Nenhuma compra</h3><button onClick={() => setCurrentScreen("catalog")} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium">Explorar Produtos</button></div>
          ) : (
            <div className="space-y-4">{purchaseHistory.map(o=>(
              <div key={o.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md cursor-pointer" onClick={() => setSelected(o)}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div><p className="font-semibold text-lg">Pedido #{o.id}</p><p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" />{o.date}</p></div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusCls[o.status]}`}>{o.status}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  {o.items.slice(0,3).map((item,i)=>(<div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted"><ProductImage src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-cover" /></div>))}
                  {o.items.length > 3 && <span className="text-sm text-muted-foreground">+{o.items.length-3}</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">{o.items.length} produto(s)</span>
                  <span className="text-xl font-bold text-primary">R$ {o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}</div>
          )}
        </div></div>
        <Footer />
      </div>
    );
  };

  const CartScreen = () => (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Carrinho</h1><p className="text-muted-foreground mt-1">{cartCount} item(ns)</p></div>
          <button onClick={() => setCurrentScreen("catalog")} className="px-5 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 font-medium flex items-center gap-2 text-sm"><ArrowRight className="w-4 h-4 rotate-180" /> Continuar Comprando</button>
        </div>
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Carrinho vazio</h3><p className="text-muted-foreground mb-6">Adicione produtos do catálogo</p>
            <button onClick={() => setCurrentScreen("catalog")} className="px-6 py-3 bg-primary text-white rounded-xl font-medium">Explorar Produtos</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item=>(
                <div key={item.product.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0"><ProductImage src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.product.categoria}</div>
                      <h3 className="font-semibold leading-tight">{item.product.nome}</h3>
                      <p className="text-primary font-bold text-lg mt-1">R$ {item.product.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <button onClick={() => updateQty(item.product.id,-1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id,1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="text-sm text-muted-foreground">Subtotal: <span className="font-semibold text-foreground">R$ {(item.product.preco*item.quantity).toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border p-6 sticky top-28">
                <h2 className="font-semibold text-lg mb-5">Resumo do Pedido</h2>
                <div className="space-y-3 mb-5">
                  {cart.map(item=>(
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.product.nome} × {item.quantity}</span>
                      <span className="font-medium flex-shrink-0">R$ {(item.product.preco*item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mb-6 flex items-center justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="text-2xl font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={handleCartCheckout} className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all">
                  <CheckCircle2 className="w-5 h-5" /> Finalizar Compra
                </button>
                <div className="mt-4 p-3 bg-accent rounded-xl text-xs text-center text-muted-foreground">Pagamento e retirada presencialmente na Casa Azul</div>
              </div>
            </div>
          </div>
        )}
      </div></div>
      <Footer />
    </div>
  );

  const CheckoutScreen = () => {
    if (!currentUser) return <LoginScreen />;
    if (cart.length === 0) { setCurrentScreen("cart"); return null; }
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <button onClick={() => setCurrentScreen("cart")} className="mb-8 text-muted-foreground hover:text-foreground flex items-center gap-2 font-medium"><ChevronRight className="w-5 h-5 rotate-180" /> Voltar ao Carrinho</button>
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#163E8F] to-[#2F5FD0] p-6 text-white">
              <h1 className="text-2xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Finalizar Compra</h1>
              <p className="text-white/80 text-sm mt-1">Revise seus dados e produtos antes de confirmar</p>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" />Seus Dados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[{l:"Nome",v:currentUser.name},{l:"Telefone",v:currentUser.phone},{l:"E-mail",v:currentUser.email}].map((f,i)=>(
                    <div key={i} className="p-4 bg-accent rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{f.l}</p><p className="font-medium text-sm truncate">{f.v}</p></div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border" />
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Produtos</h2>
                <div className="space-y-3">
                  {cart.map(item=>(
                    <div key={item.product.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"><ProductImage src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0"><p className="font-medium line-clamp-1">{item.product.nome}</p><p className="text-sm text-muted-foreground">{item.product.categoria}</p></div>
                      <div className="text-right flex-shrink-0"><p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p><p className="font-bold text-primary">R$ {(item.product.preco*item.quantity).toFixed(2)}</p></div>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 flex-shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-5 bg-primary/5 rounded-xl border border-primary/15 flex items-center justify-between">
                  <span className="font-semibold text-lg">Valor Total</span><span className="text-3xl font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-[#EAF2FF] rounded-xl p-5 border border-primary/15 text-sm text-muted-foreground leading-relaxed"><strong className="text-foreground">Atenção:</strong> O pagamento e a retirada ocorrem presencialmente na Casa Azul.</div>
              <button onClick={handleConfirmOrder} disabled={isSubmittingOrder} className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-wait">
                <CheckCircle2 className="w-5 h-5" /> {isSubmittingOrder ? "Registrando compra..." : "Confirmar Compra"}
              </button>
            </div>
          </div>
        </div></div>
        <Footer />
      </div>
    );
  };

  const OrderConfirmationScreen = () => {
    const latest = orders[0];
    const user = currentUser?.name || "Cliente";
    const phone = currentUser?.phone || "";
  const lines = latest?.items.map(i => `- ${i.product.nome} (${i.quantity}x) – R$ ${(i.product.preco*i.quantity).toFixed(2)}`).join("\n") || "";
    const msg = encodeURIComponent(`Olá, Casa Azul!\nGostaria de confirmar minha compra/reserva.\n\nCliente: ${user}\nTelefone: ${phone}\n\nProdutos:\n${lines}\n\nValor total: R$ ${(latest?.total||0).toFixed(2)}\nData: ${latest?.date||""}\n\nAguardo confirmação.`);
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12 text-green-600" /></div>
            <h1 className="text-3xl font-bold mb-3" style={{fontFamily:"Poppins,sans-serif"}}>Pedido Confirmado!</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">Sua solicitação foi registrada. Pagamento e retirada presencialmente na Casa Azul.</p>
            {latest && (
              <div className="bg-muted rounded-xl p-5 mb-6 text-left">
                <div className="flex items-center justify-between mb-3"><p className="font-semibold">Pedido #{latest.id}</p><span className="text-xs px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200 font-medium">{latest.status}</span></div>
                <div className="space-y-2 mb-3">{latest.items.map((item,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"><ProductImage src={item.product.imagem} alt={item.product.nome} className="w-full h-full object-cover" /></div>
                    <span className="text-sm flex-1 line-clamp-1">{item.product.nome}</span>
                    <span className="text-sm font-medium text-primary">R$ {item.product.preco.toFixed(2)}</span>
                  </div>
                ))}</div>
                <div className="border-t border-border pt-3 flex items-center justify-between"><span className="font-medium">Total</span><span className="font-bold text-primary text-lg">R$ {latest.total.toFixed(2)}</span></div>
              </div>
            )}
            <a href={`https://wa.me/${whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg mb-4">
              <MessageCircle className="w-5 h-5" /> Enviar Pedido pelo WhatsApp
            </a>
            <div className="flex gap-3">
              <button onClick={() => setCurrentScreen("purchase-history")} className="flex-1 py-3 bg-accent text-primary rounded-xl hover:bg-accent/80 font-medium text-sm">Histórico de Compras</button>
              <button onClick={() => setCurrentScreen("home")} className="flex-1 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 font-medium text-sm">Voltar ao Início</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmReservationScreen = () => {
    if (!selectedProduct || !currentUser) return null;
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <button onClick={() => setCurrentScreen("product-detail")} className="mb-8 text-muted-foreground hover:text-foreground flex items-center gap-2 font-medium"><ChevronRight className="w-5 h-5 rotate-180" /> Voltar ao Produto</button>
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#163E8F] to-[#2F5FD0] p-6 text-white"><h1 className="text-2xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Confirmar Reserva</h1></div>
            <div className="p-8 space-y-8">
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" />Seus Dados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[{l:"Nome",v:currentUser.name},{l:"Telefone",v:currentUser.phone},{l:"E-mail",v:currentUser.email}].map((f,i)=>(<div key={i} className="p-4 bg-accent rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{f.l}</p><p className="font-medium text-sm truncate">{f.v}</p></div>))}
                </div>
              </div>
              <div className="border-t border-border" />
              <div>
                <h2 className="font-semibold text-lg mb-4">Produto</h2>
                <div className="flex items-center gap-5 p-5 bg-muted rounded-2xl">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"><ProductImage src={selectedProduct.imagem} alt={selectedProduct.nome} className="w-full h-full object-cover" /></div>
                  <div><div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{selectedProduct.categoria}</div><h3 className="font-semibold text-lg">{selectedProduct.nome}</h3><p className="text-2xl font-bold text-primary mt-1">R$ {selectedProduct.preco.toFixed(2)}</p></div>
                </div>
              </div>
              <div className="bg-[#EAF2FF] rounded-xl p-5 border border-primary/15 text-sm text-muted-foreground"><strong className="text-foreground">Importante:</strong> Pagamento e retirada presencialmente na Casa Azul.</div>
              <button onClick={handleConfirmReservation} disabled={reservationSaving} className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"><CheckCircle2 className="w-5 h-5" /> {reservationSaving ? "Registrando reserva..." : "Confirmar Reserva"}</button>
            </div>
          </div>
        </div></div>
        <Footer />
      </div>
    );
  };

  const ConfirmationScreen = () => {
    const name = currentUser?.name || "Cliente";
    const phone = currentUser?.phone || "";
    const pName = selectedProduct?.nome || "Produto";
    const msg = encodeURIComponent(`Olá!\n\nGostaria de confirmar minha reserva no Bazar Solidário Casa Azul.\n\nNome: ${name}\nTelefone: ${phone}\nProduto: ${pName}\n\nReserva realizada através da plataforma.`);
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12 text-green-600" /></div>
            <h1 className="text-3xl font-bold mb-3" style={{fontFamily:"Poppins,sans-serif"}}>Reserva registrada!</h1><p className="font-semibold mb-3">Número da reserva: {lastReservationId}</p>
            <p className="text-muted-foreground mb-6 leading-relaxed">Clique em "Continuar para WhatsApp" para combinar os detalhes com a equipe da Casa Azul.</p>
            {selectedProduct && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl mb-8 text-left">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"><ProductImage src={selectedProduct.imagem} alt={selectedProduct.nome} className="w-full h-full object-cover" /></div>
                <div><p className="font-semibold">{selectedProduct.nome}</p><p className="text-primary font-bold text-lg">R$ {selectedProduct.preco.toFixed(2)}</p></div>
              </div>
            )}
            <a href={`https://wa.me/${whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg mb-4"><MessageCircle className="w-5 h-5" /> Continuar para WhatsApp</a>
            <div className="flex gap-3">
              <button onClick={() => setCurrentScreen("my-reservations")} className="flex-1 py-3 bg-accent text-primary rounded-xl hover:bg-accent/80 font-medium text-sm">Minhas Reservas</button>
              <button onClick={() => { setCurrentScreen("home"); setSelectedProduct(null); }} className="flex-1 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 font-medium text-sm">Voltar ao Início</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Content Screens ────────────────────────────────────────────────────────

  const HomeScreen = () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#EAF2FF] to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{fontFamily:"Poppins,sans-serif"}}>Bazar Solidário<br /><span className="text-primary">Casa Azul</span></h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">Renove seu guarda-roupa e transforme vidas. Cada compra contribui para apoiar crianças e famílias em situação de vulnerabilidade.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setCurrentScreen("catalog")} className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"><ShoppingBag className="w-5 h-5" /> Explorar Produtos</button>
                <button onClick={() => setCurrentScreen("about")} className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all"><Info className="w-5 h-5" /> Conheça a Casa Azul</button>
              </div>
              {!isLoggedIn && (
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-primary" /></div>
                  <div className="flex-1"><p className="font-medium text-sm">Crie sua conta e reserve produtos</p><p className="text-xs text-muted-foreground">Cadastro rápido e gratuito</p></div>
                  <button onClick={() => setCurrentScreen("register")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0">Cadastrar</button>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"><img src="https://images.unsplash.com/photo-1516013474378-d6498f0d1434?w=800&h=600&fit=crop" alt="Casa Azul" className="w-full h-full object-cover" /></div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-border">
                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center"><Heart className="w-7 h-7 text-primary fill-primary" /></div><div><div className="text-2xl font-bold text-primary">+500</div><div className="text-sm text-muted-foreground">Famílias Atendidas</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[{I:Users,v:"500+",l:"Famílias Atendidas",c:"text-primary",b:"bg-primary/10"},{I:Heart,v:"1.200+",l:"Crianças Beneficiadas",c:"text-secondary",b:"bg-secondary/10"},{I:Package,v:"3.500+",l:"Produtos Disponíveis",c:"text-primary",b:"bg-primary/10"},{I:Award,v:"15",l:"Anos de Atuação",c:"text-secondary",b:"bg-secondary/10"}].map((s,i)=>(
              <div key={i} className="text-center">
                <div className={`w-16 h-16 ${s.b} rounded-2xl flex items-center justify-center mx-auto mb-4`}><s.I className={`w-8 h-8 ${s.c}`} /></div>
                <div className={`text-4xl font-bold ${s.c}`} style={{fontFamily:"Poppins,sans-serif"}}>{s.v}</div>
                <div className="text-muted-foreground font-medium mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={howItWorksRef} className="py-20 bg-[#F8F3EB]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>Como Funciona</h2><p className="text-lg text-muted-foreground max-w-2xl mx-auto">Processo simples para comprar produtos solidários</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{I:UserPlus,t:"Crie sua conta",d:"Cadastre-se gratuitamente e acesse todas as funcionalidades"},{I:Search,t:"Escolha os produtos",d:"Navegue pelo catálogo e adicione ao carrinho os itens desejados"},{I:CheckCircle2,t:"Confirme o pedido",d:"Revise seus produtos e confirme a compra com um clique"},{I:Package,t:"Retire e pague",d:"Compareça à Casa Azul para retirada e pagamento presencial"}].map((s,i)=>(
              <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow h-full">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6"><s.I className="w-7 h-7 text-white" /></div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">{i+1}</div>
                <h3 className="font-semibold text-xl mb-3">{s.t}</h3><p className="text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={categoriesRef} className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>Categorias</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[{n:"Feminino" as Category,I:Shirt,c:"bg-pink-100 text-pink-600"},{n:"Masculino" as Category,I:Shirt,c:"bg-blue-100 text-blue-600"},{n:"Infantil" as Category,I:Baby,c:"bg-purple-100 text-purple-600"},{n:"Calçados" as Category,I:Footprints,c:"bg-green-100 text-green-600"},{n:"Livros" as Category,I:Book,c:"bg-orange-100 text-orange-600"},{n:"Brinquedos" as Category,I:Gamepad2,c:"bg-red-100 text-red-600"},{n:"Acessórios" as Category,I:Watch,c:"bg-yellow-100 text-yellow-600"}].map((cat,i)=>(
              <button key={i} onClick={() => { setSelectedCategory(cat.n); setCurrentScreen("catalog"); }} className="bg-white border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-lg group text-center transition-all">
                <div className={`w-16 h-16 ${cat.c} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><cat.I className="w-8 h-8" /></div>
                <h3 className="font-semibold text-lg">{cat.n}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#EAF2FF]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>Produtos em Destaque</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">{allProducts.slice(0,4).map(p=><ProductCard key={p.id} product={p} />)}</div>
          <div className="text-center"><button onClick={() => setCurrentScreen("catalog")} className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg inline-flex items-center gap-2">Ver Todos os Produtos <ChevronRight className="w-5 h-5" /></button></div>
        </div>
      </section>
      <Footer />
    </div>
  );

  const CatalogScreen = () => (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8"><h1 className="text-3xl md:text-4xl font-bold mb-2" style={{fontFamily:"Poppins,sans-serif"}}>Catálogo de Produtos</h1><p className="text-muted-foreground">{filteredProducts.length} produtos encontrados</p></div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border p-6 sticky top-28 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Filter className="w-5 h-5" /> Filtros</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as Category|"all")} className="w-full px-4 py-2.5 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="all">Todas</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preço máx: R$ {priceRange[1]}</label>
                <input type="range" min="0" max="100" value={priceRange[1]} onChange={e => setPriceRange([0,parseInt(e.target.value)])} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Disponibilidade</label>
                <div className="space-y-2">
                  {[
  {v:"all",l:"Todos"},
  {v:"disponivel",l:"Disponível"},
  {v:"reservado",l:"Reservado"},
  {v:"indisponivel",l:"Indisponível"}
].map(o=>(
                    <label key={o.v} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="status" value={o.v} checked={statusFilter===o.v} onChange={e => setStatusFilter(e.target.value as ProductStatus|"all")} className="w-4 h-4 text-primary" /><span className="text-sm">{o.l}</span></label>
                  ))}
                </div>
              </div>
              <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setPriceRange([0,100]); setStatusFilter("all"); }} className="w-full py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium">Limpar Filtros</button>
            </div>
          </div>
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20"><Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3></div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
            )}
          </div>
        </div>
      </div></div>
      <Footer />
    </div>
  );

  const ProductDetailScreen = () => {
    if (!selectedProduct) return null;
    const inCart = cart.some(i => i.product.id === selectedProduct.id);
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8">
          <button onClick={() => setCurrentScreen("catalog")} className="mb-8 text-muted-foreground hover:text-foreground flex items-center gap-2 font-medium"><ChevronRight className="w-5 h-5 rotate-180" /> Voltar ao Catálogo</button>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted mb-4"><ProductImage src={selectedProduct.imagem} alt={selectedProduct.nome} className="w-full h-full object-cover" /></div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">{selectedProduct.categoria}</div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>{selectedProduct.nome}</h1>
                <div className="flex items-center gap-4"><span className="text-4xl font-bold text-primary">R$ {selectedProduct.preco.toFixed(2)}</span><StatusBadge status={productAvailability(selectedProduct)} /></div>
              </div>
              <div className="border-t border-b border-border py-6 space-y-4">
                <div><h3 className="font-semibold mb-2">Descrição</h3><p className="text-muted-foreground leading-relaxed">{selectedProduct.descricao}</p></div>
                <div><h3 className="font-semibold mb-2">Estado de Conservação</h3><p className="text-muted-foreground">{selectedProduct.condicao}</p></div>
              </div>
              <div className="bg-[#EAF2FF] border border-primary/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Heart className="w-6 h-6 text-white fill-white" /></div>
                  <div><h3 className="font-semibold text-lg mb-2">Compra Solidária</h3><p className="text-sm text-muted-foreground leading-relaxed">Sua compra ajuda a manter os projetos sociais da Casa Azul.</p></div>
                </div>
              </div>
              {productAvailability(selectedProduct) === "disponivel" ? (
                <div className="space-y-3">
                  <button type="button" translate="no" onClick={() => { addToCart(selectedProduct); }} className={`w-full px-4 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${inCart ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90 shadow-lg hover:-translate-y-0.5"}`}>
                    <ShoppingCart aria-hidden="true" className="w-5 h-5 shrink-0" /><span>{inCart ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}</span>
                  </button>
                  {inCart && <button type="button" translate="no" onClick={() => setCurrentScreen("cart")} className="w-full py-3 bg-accent text-primary border border-primary/20 rounded-xl hover:bg-primary/10 font-medium flex items-center justify-center gap-2"><ChevronRight aria-hidden="true" className="w-5 h-5 shrink-0" /><span>Ver carrinho</span></button>}
                  <button type="button" translate="no" onClick={handleReserveClick} className="w-full py-3 bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white font-medium flex items-center justify-center gap-2 transition-all">
                    {isLoggedIn ? <><CheckCircle2 aria-hidden="true" className="w-5 h-5 shrink-0" /><span>Reservar este produto</span></> : <><LogIn aria-hidden="true" className="w-5 h-5 shrink-0" /><span>Entrar para reservar</span></>}
                  </button>
                </div>
              ) : (
                <button disabled className="w-full py-4 bg-muted text-muted-foreground rounded-xl font-semibold text-lg cursor-not-allowed">{selectedProduct.status==="vendido"?"Produto Vendido":"Produto Indisponível"}</button>
              )}
              <button onClick={() => setCurrentScreen("contact")} className="w-full py-3 bg-white text-foreground border border-border rounded-xl hover:bg-muted font-medium flex items-center justify-center gap-2 transition-all"><MessageCircle className="w-5 h-5" /> Falar com a Casa Azul</button>
            </div>
          </div>
        </div></div>
        <Footer />
      </div>
    );
  };

  const AboutScreen = () => (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16"><h1 className="text-4xl md:text-5xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>Sobre a Casa Azul</h1><p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Transformando vidas através da solidariedade há mais de 15 anos</p></div>
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-16 shadow-xl bg-primary/10"><img src="https://images.unsplash.com/photo-1649887221640-481c952df72e?w=1200&h=500&fit=crop" alt="Voluntários" className="w-full h-full object-cover" /></div>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Book className="w-6 h-6 text-primary" /></div>Nossa História</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">A Casa Azul nasceu em 2009 com o objetivo de acolher e apoiar crianças, adolescentes e famílias em situação de vulnerabilidade social.</p>
            <p className="text-muted-foreground leading-relaxed">Nosso Bazar Solidário oferece produtos de qualidade a preços acessíveis, ao mesmo tempo em que gera recursos para manter nossos projetos sociais.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{t:"Missão",d:"Promover o desenvolvimento integral de crianças e famílias através de ações de acolhimento, educação e assistência social."},{t:"Visão",d:"Ser referência em assistência social, contribuindo para uma sociedade mais justa e solidária."},{t:"Valores",d:"Amor, respeito, solidariedade, transparência e compromisso com a transformação social."}].map((item,i)=>(
              <div key={i} className="bg-[#EAF2FF] rounded-xl p-8 border border-primary/20"><h3 className="text-xl font-bold mb-3">{item.t}</h3><p className="text-muted-foreground leading-relaxed">{item.d}</p></div>
            ))}
          </div>
        </div>
      </div></div>
      <Footer />
    </div>
  );

  const ContactScreen = () => {
    const [form, setForm] = useState({name:"",email:"",message:""});
    const [sent, setSent] = useState(false);
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-28 pb-20"><div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16"><h1 className="text-4xl md:text-5xl font-bold mb-4" style={{fontFamily:"Poppins,sans-serif"}}>Entre em Contato</h1></div>
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Informações</h2>
              <div className="space-y-6">
                {[{I:MapPin,t:"Endereço",d:"Rua da Esperança, 123\nCentro - São Paulo, SP"},{I:Phone,t:"Telefone",d:"(11) 98765-4321"},{I:MessageCircle,t:"WhatsApp",d:"(11) 98765-4321"},{I:Mail,t:"E-mail",d:"contato@casaazul.org"}].map((item,i)=>(
                  <div key={i} className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><item.I className="w-6 h-6 text-primary" /></div><div><h3 className="font-semibold mb-1">{item.t}</h3><p className="text-muted-foreground text-sm whitespace-pre-line">{item.d}</p></div></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Envie uma Mensagem</h2>
              {sent ? (
                <div className="text-center py-12"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="font-semibold text-xl mb-2">Mensagem enviada!</h3><button onClick={() => setSent(false)} className="mt-4 text-primary hover:underline">Enviar outra mensagem</button></div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
                  {[{l:"Nome",f:"name",t:"text",p:"Seu nome"},{l:"E-mail",f:"email",t:"email",p:"seu@email.com"}].map(f=>(
                    <div key={f.f}><label className="block text-sm font-medium mb-2">{f.l} *</label><input type={f.t} required value={form[f.f as keyof typeof form] as string} onChange={e => setForm({...form,[f.f]:e.target.value})} placeholder={f.p} className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  ))}
                  <div><label className="block text-sm font-medium mb-2">Mensagem *</label><textarea required rows={6} value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder="Como podemos ajudar?" className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" /></div>
                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold text-lg flex items-center justify-center gap-2">Enviar Mensagem <ArrowRight className="w-5 h-5" /></button>
                </form>
              )}
            </div>
          </div>
        </div></div>
        <Footer />
      </div>
    );
  };

  // ─── Admin Screen ──────────────────────────────────────────────────────────

  const AdminScreen = () => {
    const [selectedSale, setSelectedSale] = useState<Order | null>(null);
    const saleDialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
      if (selectedSale && saleDialogRef.current && !saleDialogRef.current.open) {
        saleDialogRef.current.showModal();
      }
    }, [selectedSale]);
    const saleWhatsAppUrl = (sale: Order) => {
      const message = [
        `Bazar Solidário Casa Azul — Venda nº ${sale.id}`,
        `Cliente: ${sale.cliente || "Cliente"}`,
        `Data: ${sale.date}`,
        `Status: ${sale.status}`,
        "Produtos:",
        ...sale.items.map(item => `${item.quantity} × ${item.product.nome} — R$ ${(item.quantity * item.product.preco).toFixed(2)}`),
        `Total: R$ ${sale.total.toFixed(2)}`,
        `Forma de pagamento: ${sale.formaPagamento || "Não informada"}`
      ].join("\n");
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };
    const [localAdminUsers, setLocalAdminUsers] = useState(adminUsers);
    const [localOrders, setLocalOrders] = useState(orders);
    const draft = (() => { try { const value = localStorage.getItem("bazar.productDraft"); return value ? JSON.parse(value) : null; } catch { return null; } })();
    const [showModal, setShowModal] = useState(() => Boolean(draft?.open));
    const [viewUser, setViewUser] = useState<AdminUser | null>(null);
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
  nome: "",
  email: "",
  senha: "",
  tipo: "usuario"
});

const excluirUsuario = async (id: number) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Sessão administrativa não encontrada.");
    return;
  }

  const confirmar = window.confirm(
    "Tem certeza que deseja excluir este usuário?"
  );

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      toast.error(dados.erro || "Erro ao excluir usuário.");
      return;
    }

    setLocalAdminUsers(prev =>
      prev.filter(usuario => usuario.id !== id)
    );

    toast.success("Usuário excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    toast.error("Não foi possível excluir o usuário.");
  }
};

const salvarEdicaoUsuario = async () => {
  if (!editUser) return;

  if (!editUser.name.trim() || !editUser.email.trim()) {
    toast.error("Nome e e-mail são obrigatórios.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Sessão administrativa não encontrada.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/usuarios/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: editUser.name,
        email: editUser.email,
        tipo: editUser.tipo
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      toast.error(dados.erro || "Erro ao editar usuário.");
      return;
    }

    setLocalAdminUsers(prev =>
      prev.map(usuario =>
        usuario.id === editUser.id
          ? {
              ...usuario,
              name: dados.usuario.nome,
              email: dados.usuario.email,
              tipo: dados.usuario.tipo
            }
          : usuario
      )
    );

    setEditUser(null);
    toast.success("Usuário atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    toast.error("Não foi possível editar o usuário.");
  }
};

const cadastrarUsuarioAdmin = async () => {
  if (!userForm.nome || !userForm.email || !userForm.senha || !userForm.tipo) {
    toast.error("Preencha todos os campos.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Sessão administrativa não encontrada.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/usuarios/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userForm)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      toast.error(dados.erro || "Erro ao cadastrar usuário.");
      return;
    }

    toast.success("Usuário cadastrado com sucesso!");

    setUserForm({
      nome: "",
      email: "",
      senha: "",
      tipo: "usuario"
    });

    setShowUserModal(false);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    toast.error("Não foi possível cadastrar o usuário.");
  }
};


useEffect(() => {
  if (adminRole !== "admin") return;

  const carregarUsuarios = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const resposta = await fetch(`${API_URL}/api/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        console.error("Erro ao carregar usuários:", dados);
        return;
      }

      const usuariosConvertidos: AdminUser[] = dados.map((u: any) => ({
        id: u.id,
        name: u.nome,
        email: u.email,
        phone: u.telefone || "-",
        registeredAt: u.criado_em
          ? new Date(u.criado_em).toLocaleDateString("pt-BR")
          : "-",
        status: "Ativo",
        tipo: u.tipo
      }));

      setLocalAdminUsers(usuariosConvertidos);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  carregarUsuarios();
}, [adminRole]);

    const [deleteId, setDeleteId] = useState<number|null>(null);
const [editingProduct, setEditingProduct] = useState<Product|null>(() => draft?.editingId ? allProducts.find(p => p.id === draft.editingId) || null : null);
useEffect(() => { localStorage.setItem("bazar.adminTab", adminTab); }, [adminTab]);
const [whatsappInput, setWhatsappInput] = useState(whatsapp);
const salvarWhatsApp = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Sessão administrativa não encontrada.");
    return;
  }

  if (!whatsappInput.trim()) {
    toast.error("Informe o número do WhatsApp.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/configuracoes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        whatsapp: whatsappInput.trim()
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      toast.error(dados.erro || "Erro ao salvar WhatsApp.");
      return;
    }

    setWhatsapp(whatsappInput.trim());
    toast.success("WhatsApp atualizado com sucesso!");
  } catch (error) {
    console.error(error);
    toast.error("Não foi possível salvar o WhatsApp.");
  }
};

    const [photoBusy, setPhotoBusy] = useState(false);
    const [productSaving, setProductSaving] = useState(false);
    const productSavingRef = useRef(false);
    const [pForm, setPForm] = useState(() => draft?.form || {
  nome:"",
  categoria:"Feminino" as Category,
  descricao:"",
  condicao:"",
  preco:"",
  quantidade:"1",
  status:"disponivel" as ProductStatus,
  imagem:""
});
useEffect(() => {
  localStorage.setItem("bazar.productDraft", JSON.stringify({ open: showModal, editingId: editingProduct?.id || null, form: pForm }));
}, [showModal, editingProduct?.id, pForm]);

    const openAdd = () => {
  setEditingProduct(null);
  setPForm({
    nome:"",
    categoria:"Feminino",
    descricao:"",
    condicao:"",
    preco:"",
    quantidade:"1",
    status:"disponivel",
    imagem:""
  });
  setShowModal(true);
};
   const openEdit = (p: Product) => {
  setEditingProduct(p);
  setPForm({
    nome:p.nome,
    categoria:p.categoria,
    descricao:p.descricao,
    condicao:p.condicao,
    preco:String(p.preco),
    quantidade:String(p.quantidade ?? 0),
    status:p.status,
    imagem:p.imagem
  });
  setShowModal(true);
};

  const saveProduct = async () => {
  if (photoBusy || productSavingRef.current) return;
  const preco = Number(pForm.preco);
  const quantidade = Number(pForm.quantidade);

  if (!pForm.nome || !pForm.preco) {
    toast.error("Preencha nome e valor");
    return;
  }

  if (!Number.isFinite(preco) || preco < 0 || !/^\d+$/.test(pForm.quantidade) || !Number.isInteger(quantidade) || quantidade > 2147483647) {
    toast.error("Informe um valor válido e uma quantidade inteira a partir de zero.");
    return;
  }

  const imageUrl = pForm.imagem.trim();
  if (imageUrl && !imageUrl.startsWith("data:image/jpeg;base64,")) {
    try {
      const url = new URL(imageUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid image URL");
    } catch {
      toast.error("Informe um link de foto começando com http:// ou https://.");
      return;
    }
  }

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Faça login novamente como administrador.");
    return;
  }

  const dadosProduto = {
    nome: pForm.nome,
    descricao: pForm.descricao,
    categoria: pForm.categoria,
    preco,
    ...(editingProduct
      ? quantidade === Number(editingProduct.quantidade ?? 0) ? {} : { quantidade, quantidade_anterior: Number(editingProduct.quantidade ?? 0) }
      : { quantidade }),
    status: pForm.status,
    condicao: pForm.condicao,
    imagem: imageUrl
  };

  productSavingRef.current = true;
  setProductSaving(true);
  try {
    if (editingProduct) {
      const resposta = await fetch(
        `${API_URL}/api/produtos/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dadosProduto)
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (resposta.status === 409) void refreshProducts();
        throw new Error(dados.erro || "Erro ao atualizar produto.");
      }

      const produtoAtualizado = {
        ...dados.produto,
        preco: Number(dados.produto.preco),
        condicao: dados.produto.condicao || "",
        imagem: dados.produto.imagem || "",
        imagens: dados.produto.imagem
          ? [dados.produto.imagem]
          : []
      };

      setAllProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id ? produtoAtualizado : p
        )
      );

      toast.success("Produto atualizado!");
    } else {
      const resposta = await fetch(
        `${API_URL}/api/produtos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dadosProduto)
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao cadastrar produto.");
      }

      const novoProduto = {
        ...dados.produto,
        preco: Number(dados.produto.preco),
        condicao: dados.produto.condicao || "",
        imagem: dados.produto.imagem || "",
        imagens: dados.produto.imagem
          ? [dados.produto.imagem]
          : []
      };

      setAllProducts(prev => [novoProduto, ...prev]);

      toast.success("Produto cadastrado no banco!");
    }

    setShowModal(false);
  } catch (error) {
    console.error("Erro ao salvar produto:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Erro ao salvar produto."
    );
  } finally {
    productSavingRef.current = false;
    setProductSaving(false);
  }
};

const deleteProd = async (id: number) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Faça login novamente como administrador.");
    return;
  }

  try {
    const resposta = await fetch(
      `${API_URL}/api/produtos/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao excluir produto.");
    }

    setAllProducts(prev =>
      prev.filter(produto => produto.id !== id)
    );

    setDeleteId(null);

    toast.success("Produto removido do banco!");
  } catch (error) {
    console.error("Erro ao excluir produto:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Erro ao excluir produto."
    );
  }
};

    const salesData = (() => {
      const nomesMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      const hoje = new Date();
      const baldes = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        baldes.push({ mes: nomesMeses[d.getMonth()], vendas: 0, valor: 0, ano: d.getFullYear(), mesIndex: d.getMonth() });
      }
      localOrders.forEach(o => {
        const partes = o.date.split("/");
        if (partes.length !== 3) return;
        const mesIndex = Number(partes[1]) - 1;
        const ano = Number(partes[2]);
        const balde = baldes.find(b => b.ano === ano && b.mesIndex === mesIndex);
        if (balde) { balde.vendas += 1; balde.valor += o.total; }
      });
      return baldes.map(({ mes, vendas, valor }) => ({ mes, vendas, valor }));
    })();
    const pieData = [
      {name:"Disponível",value:allProducts.filter(p=>p.status==="disponivel").length,color:"#22c55e"},
      {name:"Reservado",value:allProducts.filter(p=>p.status==="reservado").length,color:"#eab308"},
      {name:"Vendido",value:allProducts.filter(p=>p.status==="vendido").length,color:"#6b7280"},
      {name:"Indisponível",value:allProducts.filter(p=>p.status==="indisponivel").length,color:"#d1d5db"},
    ].filter(d=>d.value>0);
    const catData = CATEGORIES.map(cat=>({
      name:cat.length>8?cat.slice(0,7)+".":cat,
      Disponível:allProducts.filter(p=>p.categoria===cat&&p.status==="disponivel").length,
      Reservado:allProducts.filter(p=>p.categoria===cat&&p.status==="reservado").length,
      Vendido:allProducts.filter(p=>p.categoria===cat&&p.status==="vendido").length,
    }));

const tabs: {
  id: AdminTabType;
  label: string;
  I: React.ComponentType<{className?: string}>
}[] = [
  {id:"dashboard", label:"Dashboard", I:BarChart3},

  ...(adminRole === "admin"
    ? [
        {id:"users" as AdminTabType, label:"Usuários", I:Users},
        {id:"categories" as AdminTabType, label:"Categorias", I:Filter},
        {id:"reports" as AdminTabType, label:"Relatórios", I:TrendingUp},
        {id:"whatsapp" as AdminTabType, label:"WhatsApp", I:Phone},
      ]
    : []),

  {id:"products", label:"Produtos", I:Package},
  {id:"reservations", label:"Reservas / Vendas", I:ShoppingBag},
];
    return (
      <div className="flex min-h-screen bg-muted">
        {/* Sidebar */}
        <div className="bg-white border-b lg:border-r border-border w-full lg:w-64 lg:min-h-screen lg:sticky lg:top-0 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-white fill-white" /></div><div><div className="font-bold text-primary">Casa Azul</div><div className="text-xs text-muted-foreground">Painel Admin</div></div></div>
          </div>
          <nav className="flex-1 p-3 lg:p-4 flex flex-wrap lg:block gap-1">
            {tabs.map(t=>(
              <button key={t.id} onClick={() => setAdminTab(t.id)} className={`w-full lg:w-full flex-1 min-w-[135px] px-3 lg:px-4 py-3 rounded-xl flex items-center justify-center lg:justify-start gap-2 lg:gap-3 font-medium text-xs lg:text-sm transition-colors ${adminTab===t.id?"bg-primary text-white":"hover:bg-muted text-foreground"}`}>
                <t.I className="w-5 h-5" />{t.label}
              </button>
            ))}
          </nav>
          <div className="p-3 lg:p-4 flex lg:block gap-2 border-t border-border">
            <button onClick={() => setCurrentScreen("home")} className="flex-1 px-3 lg:px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl flex items-center gap-2 justify-center text-xs lg:text-sm font-medium"><HomeIcon className="w-5 h-5" /> Voltar ao Site</button>
            <button onClick={handleAdminLogout} className="flex-1 px-3 lg:px-4 py-3 hover:bg-red-50 rounded-xl flex items-center gap-2 justify-center text-xs lg:text-sm font-medium text-red-500"><LogOut className="w-5 h-5" /> Sair</button>
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4 sm:p-8 overflow-auto">
          {/* DASHBOARD */}
          {adminTab==="dashboard" && (
            <div>
              <h1 className="text-3xl font-bold mb-8" style={{fontFamily:"Poppins,sans-serif"}}>Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  {I:Package,v:allProducts.length,l:"Total de Produtos",c:"text-primary",b:"bg-primary/10"},
                  {I:Check,v:allProducts.filter(p=>p.status==="disponivel").length,l:"Disponíveis",c:"text-green-600",b:"bg-green-100"},
                  {I:Clock,v:allProducts.filter(p=>p.status==="reservado").length,l:"Reservados",c:"text-yellow-600",b:"bg-yellow-100"},
                  {I:ShoppingBag,v:allProducts.filter(p=>p.status==="vendido").length,l:"Vendidos",c:"text-gray-600",b:"bg-gray-200"},
                  {I:Receipt,v:orders.length+12,l:"Total de Vendas",c:"text-secondary",b:"bg-secondary/10"},
                  {I:Users,v:localAdminUsers.length,l:"Usuários Cadastrados",c:"text-primary",b:"bg-primary/10"},
                ].map((s,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4"><div className={`w-12 h-12 ${s.b} rounded-xl flex items-center justify-center`}><s.I className={`w-6 h-6 ${s.c}`} /></div><TrendingUp className="w-5 h-5 text-green-500" /></div>
                    <div className="text-3xl font-bold mb-1">{s.v}</div><div className="text-sm text-muted-foreground font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {adminRole === "admin" && (
                  <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-lg mb-4">Usuários Recentes</h3>
                  <div className="space-y-3">{localAdminUsers.slice(0,4).map(u=>(
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{u.name}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status==="Ativo"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{u.status}</span>
                    </div>
                  ))}</div>
                </div>
                )}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-lg mb-4">Pedidos Recentes</h3>
                  <div className="space-y-3">{localOrders.slice(0,3).map(o=>(
                    <div key={o.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center"><Receipt className="w-4 h-4 text-secondary" /></div>
                      <div className="flex-1"><p className="font-medium text-sm">Pedido #{o.id}</p><p className="text-xs text-muted-foreground">{o.items.length} produto(s) · {o.date}</p></div>
                      <span className="font-bold text-primary text-sm">R$ {o.total.toFixed(2)}</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}


          {adminRole === "admin" && adminTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Usuários</h1><p className="text-muted-foreground mt-1">{localAdminUsers.length} cadastrados</p></div>
                <button
  onClick={() => setShowUserModal(true)}
  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2 font-medium"
>
  <Plus className="w-5 h-5" /> Novo Usuário
</button>
              </div>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border"><tr>{["Usuário","E-mail","Telefone","Cadastro","Perfil","Status","Ações"].map(h=><th key={h} className="text-left p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody>{localAdminUsers.map(u=>(
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div><span className="font-medium whitespace-nowrap">{u.name}</span></div></td>
                        <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                        <td className="p-4 text-muted-foreground text-sm whitespace-nowrap">{u.phone}</td>
                        <td className="p-4 text-muted-foreground text-sm whitespace-nowrap">{u.registeredAt}</td>

<td className="p-4 text-sm whitespace-nowrap">
  {u.tipo === "admin"
    ? "Administrador"
    : u.tipo === "vendedor"
    ? "Vendedor"
    : "Usuário"}
</td>

                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status==="Ativo"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{u.status}</span></td>
                        <td className="p-4"><div className="flex gap-1">
                         <button
  onClick={() => setViewUser(u)}
  className="p-2 hover:bg-accent rounded-lg"
>
  <Eye className="w-4 h-4 text-primary" />
</button>
                         <button
  onClick={() => setEditUser(u)}
  className="p-2 hover:bg-accent rounded-lg"
>
  <Edit className="w-4 h-4 text-secondary" />
</button>
                          <button
  onClick={() => excluirUsuario(u.id)}
  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
>
  <X className="w-4 h-4" />
</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

{editUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Editar Usuário</h2>

        <button
          onClick={() => setEditUser(null)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome</label>
          <input
            type="text"
            value={editUser.name}
            onChange={(e) =>
              setEditUser({
                ...editUser,
                name: e.target.value
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">E-mail</label>
          <input
            type="email"
            value={editUser.email}
            onChange={(e) =>
              setEditUser({
                ...editUser,
                email: e.target.value
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Perfil</label>
          <select
            value={editUser.tipo}
            onChange={(e) =>
              setEditUser({
                ...editUser,
                tipo: e.target.value as "usuario" | "vendedor" | "admin"
              })
            }
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="usuario">Usuário</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setEditUser(null)}
            className="flex-1 py-3 border rounded-xl font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={salvarEdicaoUsuario}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{viewUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Dados do Usuário</h2>

        <button
          onClick={() => setViewUser(null)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Nome</p>
          <p className="font-semibold">{viewUser.name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">E-mail</p>
          <p className="font-semibold">{viewUser.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Telefone</p>
          <p className="font-semibold">{viewUser.phone}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Data de Cadastro</p>
          <p className="font-semibold">{viewUser.registeredAt}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-semibold">{viewUser.status}</p>
        </div>
      </div>
    </div>
  </div>
)}


{showUserModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Novo Usuário</h2>

        <button
          onClick={() => setShowUserModal(false)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={userForm.nome}
          onChange={(e) =>
            setUserForm({ ...userForm, nome: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          type="email"
          placeholder="E-mail"
          value={userForm.email}
          onChange={(e) =>
            setUserForm({ ...userForm, email: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          type="password"
          placeholder="Senha"
          value={userForm.senha}
          onChange={(e) =>
            setUserForm({ ...userForm, senha: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

        <select
          value={userForm.tipo}
          onChange={(e) =>
            setUserForm({ ...userForm, tipo: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="usuario">Usuário</option>
          <option value="vendedor">Vendedor</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          onClick={cadastrarUsuarioAdmin}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
        >
          Cadastrar Usuário
        </button>
      </div>
    </div>
  </div>
)}




          {/* PRODUCTS */}
          {adminTab==="products" && (
            <div>
              <div className="flex items-center justify-between mb-8"><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Produtos</h1>
                <button onClick={openAdd} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Adicionar Produto</button>
              </div>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead translate="no" className="bg-muted border-b border-border"><tr>{["","Nome","Categoria","Preço","Estoque","Status","Ações"].map(h=><th key={h} className="text-left p-4 font-semibold text-sm text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>{allProducts.map(p=>(
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4"><div className="w-14 h-14 rounded-xl overflow-hidden bg-muted"><ProductImage src={p.imagem} alt={p.nome} className="w-full h-full object-cover" /></div></td>
                        <td className="p-4 font-medium">{p.nome}</td>
                        <td className="p-4 text-muted-foreground text-sm">{p.categoria}</td>
                        <td className="p-4 font-semibold text-primary">R$ {p.preco.toFixed(2)}</td>
                        <td className="p-4">{p.quantidade ?? 0}</td>
                        <td className="p-4"><StatusBadge status={p.status} /></td>
                        <td className="p-4"><div className="flex gap-1">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-accent rounded-lg"><Edit className="w-4 h-4 text-primary" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {adminTab==="categories" && (
            <div>
              <div className="flex items-center justify-between mb-8"><h1 className="text-3xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>Categorias</h1>
                <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Nova Categoria</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{cat}</h3>
                      <div className="flex gap-1"><button className="p-2 hover:bg-accent rounded-lg"><Edit className="w-4 h-4 text-primary" /></button><button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button></div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{allProducts.filter(p=>p.categoria===cat).length} produto(s)</span>
                      <span className="text-green-600">{allProducts.filter(p=>p.categoria===cat&&p.status==="disponivel").length} disponíveis</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESERVATIONS */}
          {adminTab==="reservations" && (
            <div>
              <h1 className="text-3xl font-bold mb-8" style={{fontFamily:"Poppins,sans-serif"}}>Reservas / Vendas</h1>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead translate="no" className="bg-muted border-b border-border"><tr>{["Número de venda","Cliente","Produtos","Qtd","Valor","Data","Status","Ações"].map(h=><th key={h} className="text-left p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody>{localOrders.map(o=>(
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground text-sm">#{o.id}{o.origem === "reserva" && <span className="block text-xs text-primary">Reserva</span>}</td>
                        <td className="p-4 font-medium whitespace-nowrap">{o.cliente || "Cliente"}</td>
                        <td className="p-4 text-sm max-w-[160px] truncate">{o.items.map(i=>i.product.nome).join(", ")}</td>
                        <td className="p-4 text-sm text-center">{o.items.reduce((s,i)=>s+i.quantity,0)}</td>
                        <td className="p-4 font-semibold text-primary">R$ {o.total.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground text-sm whitespace-nowrap">{o.date}</td>
                        <td className="p-4">
                       <select
  value={o.status}
  onChange={async (e) => {
    const novoStatus = e.target.value as OrderStatus;
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Sessão não encontrada.");
      return;
    }

    try {
      const resposta = await fetch(
        `${API_URL}/api/vendas/${o.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: novoStatus
          })
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        toast.error(dados.erro || "Erro ao atualizar status.");
        return;
      }

      setLocalOrders(prev =>
        prev.map(venda =>
          venda.id === o.id
            ? { ...venda, status: dados.venda.status }
            : venda
        )
      );

      setOrders(prev => prev.map(venda => venda.id === o.id ? { ...venda, status: dados.venda.status } : venda));
      void refreshProducts();
      toast.success("Status atualizado com sucesso!");

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Não foi possível atualizar o status.");
    }
  }} className="text-xs px-2 py-1.5 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20">
                            {(["Pendente","Reservada","Confirmada","Finalizada","Cancelada"] as OrderStatus[]).map(s=><option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-4"><div className="flex gap-1"><button type="button" onClick={() => setSelectedSale(o)} title="Ver detalhes da venda" aria-label={`Ver detalhes da venda ${o.id}`} className="p-2 hover:bg-accent rounded-lg">
  <Eye className="w-4 h-4 text-primary" />
</button><a href={saleWhatsAppUrl(o)} target="_blank" rel="noopener noreferrer" title="Compartilhar venda no WhatsApp" aria-label={`Compartilhar venda ${o.id} no WhatsApp`} className="p-2 hover:bg-green-50 rounded-lg"><MessageCircle className="w-4 h-4 text-green-600" /></a></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

       {/* WHATSAPP */} 
{adminTab==="whatsapp" && (
  <div>
    <h1
      className="text-3xl font-bold mb-2"
      style={{fontFamily:"Poppins,sans-serif"}}
    >
      WhatsApp de Atendimento
    </h1>

    <p className="text-muted-foreground mb-8">
      Configure o número que receberá os pedidos enviados pelo site.
    </p>

    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">
          Número do WhatsApp
        </label>

       <input
  type="text"
  value={whatsappInput}
  onChange={(e) => setWhatsappInput(e.target.value)}
  placeholder="5561999999999"
  className="w-full border rounded-xl px-4 py-3"
/>

        <p className="text-sm text-muted-foreground mt-2">
          Informe o número com código do país e DDD, sem espaços,
          parênteses ou traços.
        </p>

        <button
  onClick={salvarWhatsApp}
  className="mt-5 px-5 py-3 bg-primary text-white rounded-xl font-medium"
>
  Salvar número
</button>
      </div>
    </div>
  </div>
)}

{/* REPORTS */} 
          {adminTab==="reports" && (
            <div>
              <h1 className="text-3xl font-bold mb-8" style={{fontFamily:"Poppins,sans-serif"}}>Relatórios</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {l:"Total de Usuários",v:localAdminUsers.length,c:"text-primary"},
                  {l:"Total de Produtos",v:allProducts.length,c:"text-secondary"},
                  {l:"Produtos Reservados",v:allProducts.filter(p=>p.status==="reservado").length,c:"text-yellow-600"},
                  {l:"Total de Vendas",v:`R$ ${localOrders.reduce((s,o)=>s+o.total,0).toFixed(2)}`,c:"text-green-600"},
                ].map((c,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-border p-6 text-center">
                    <div className={`text-3xl font-bold ${c.c} mb-2`} style={{fontFamily:"Poppins,sans-serif"}}>{c.v}</div>
                    <div className="text-sm text-muted-foreground">{c.l}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-lg mb-6">Vendas por Mês</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={salesData} margin={{top:0,right:10,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{fontSize:12}} />
                      <YAxis tick={{fontSize:12}} />
                      <Tooltip />
                      <Bar dataKey="vendas" fill="#163E8F" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-lg mb-6">Produtos por Status</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {pieData.map((entry,i)=><Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Legend /><Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-border p-6 mb-8">
                <h3 className="font-semibold text-lg mb-6">Produtos por Categoria</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={catData} margin={{top:0,right:10,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:12}} />
                    <Tooltip /><Legend />
                    <Bar dataKey="Disponível" stackId="a" fill="#22c55e" />
                    <Bar dataKey="Reservado" stackId="a" fill="#eab308" />
                    <Bar dataKey="Vendido" stackId="a" fill="#6b7280" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border"><h3 className="font-semibold text-lg">Histórico de Vendas</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead translate="no" className="bg-muted border-b border-border"><tr>{["#","Produtos","Qtd","Valor","Data","Status"].map(h=><th key={h} className="text-left p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody>{localOrders.map(o=>(
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm text-muted-foreground">#{o.id}</td>
                        <td className="p-4 text-sm">{o.items.length} produto(s)</td>
                        <td className="p-4 text-sm text-center">{o.items.reduce((s,i)=>s+i.quantity,0)}</td>
                        <td className="p-4 font-semibold text-primary">R$ {o.total.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground text-sm">{o.date}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${o.status==="Finalizada"?"bg-green-100 text-green-700 border-green-200":o.status==="Confirmada"?"bg-indigo-100 text-indigo-700 border-indigo-200":o.status==="Cancelada"?"bg-gray-100 text-gray-600 border-gray-200":"bg-yellow-100 text-yellow-700 border-yellow-200"}`}>{o.status}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Modal */}
        {selectedSale && (
          <dialog ref={saleDialogRef} onCancel={() => setSelectedSale(null)} onClose={() => setSelectedSale(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedSale(null); }} aria-labelledby="sale-details-title" className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-white p-0 shadow-xl backdrop:bg-black/50">
            <div className="p-6 border-b border-border flex items-center justify-between gap-4">
              <h2 id="sale-details-title" className="text-xl font-bold">Número de venda: {selectedSale.id}</h2>
              <button type="button" autoFocus onClick={() => setSelectedSale(null)} aria-label="Fechar detalhes" className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium">{selectedSale.cliente || "Cliente"}</dd></div>
                <div><dt className="text-muted-foreground">Data</dt><dd>{selectedSale.date}</dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd>{selectedSale.status}</dd></div>
                <div><dt className="text-muted-foreground">Forma de pagamento</dt><dd>{selectedSale.formaPagamento || "Não informada"}</dd></div>
              </dl>
              <div className="overflow-x-auto"><table className="w-full text-sm text-left">
                <thead><tr className="border-b"><th className="py-3 pr-3">Produto</th><th className="p-3">Quantidade</th><th className="p-3 whitespace-nowrap">Valor unitário</th><th className="py-3 pl-3">Subtotal</th></tr></thead>
                <tbody>{selectedSale.items.map((item, index) => <tr key={`${item.product.id}-${index}`} className="border-b"><td className="py-3 pr-3">{item.product.nome}</td><td className="p-3">{item.quantity}</td><td className="p-3 whitespace-nowrap">R$ {item.product.preco.toFixed(2)}</td><td className="py-3 pl-3 whitespace-nowrap">R$ {(item.product.preco * item.quantity).toFixed(2)}</td></tr>)}</tbody>
              </table></div>
              <p className="text-right text-lg font-bold">Total: R$ {selectedSale.total.toFixed(2)}</p>
              <a href={saleWhatsAppUrl(selectedSale)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 font-medium"><MessageCircle className="w-5 h-5" /> Compartilhar no WhatsApp</a>
              <p className="text-sm text-muted-foreground">Escolha o destinatário no WhatsApp e confira a mensagem antes de enviar.</p>
            </div>
          </dialog>
        )}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-2 sm:p-4" onClick={e => { if (e.target===e.currentTarget && !photoBusy && !productSaving) setShowModal(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{fontFamily:"Poppins,sans-serif"}}>{editingProduct?"Editar Produto":"Adicionar Produto"}</h2>
                <button disabled={photoBusy || productSaving} onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-medium mb-2">Nome *</label><input type="text" value={pForm.nome} onChange={e => setPForm(f=>({...f,nome:e.target.value}))} placeholder="Nome do produto" className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div><label className="block text-sm font-medium mb-2">Categoria</label>
                    <select value={pForm.categoria} onChange={e => setPForm(f=>({...f,categoria:e.target.value as Category}))} className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Descrição</label><textarea value={pForm.descricao} onChange={e => setPForm(f=>({...f,descricao:e.target.value}))} rows={3} placeholder="Descrição..." className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-medium mb-2">Estado de Conservação</label><input type="text" value={pForm.condicao} onChange={e => setPForm(f=>({...f,condicao:e.target.value}))} placeholder="Ex: Seminovo - Ótimo" className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div><label className="block text-sm font-medium mb-2">Valor (R$) *</label><input type="number" step="0.01" min="0" value={pForm.preco} onChange={e => setPForm(f=>({...f,preco:e.target.value}))} placeholder="0,00" className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                </div>
                <div>
                  <label htmlFor="product-quantity" className="block text-sm font-medium mb-2">Quantidade disponível em estoque *</label>
                  <input id="product-quantity" type="number" min="0" max="2147483647" step="1" inputMode="numeric" value={pForm.quantidade} onChange={e => setPForm(f => ({ ...f, quantidade: e.target.value }))} className="w-full px-4 py-3 bg-muted rounded-xl border border-border" />
                  <p className="mt-2 text-sm text-muted-foreground">Informe as unidades livres para compra ou reserva. Zero deixa o produto sem estoque.</p>
                </div>
                <div><label className="block text-sm font-medium mb-2">Status</label>
                  <select value={pForm.status} onChange={e => setPForm(f=>({...f,status:e.target.value as ProductStatus}))} className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="disponivel">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="indisponivel">Indisponível</option>
                  </select>
                </div>
                <ProductPhotoPicker value={pForm.imagem} onChange={imagem => setPForm(f => ({ ...f, imagem }))} onBusyChange={setPhotoBusy} />
              </div>
              <div className="p-6 border-t border-border flex gap-3 justify-end">
                <button disabled={photoBusy || productSaving} onClick={() => setShowModal(false)} className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 font-medium">Cancelar</button>
                <button disabled={photoBusy || productSaving} onClick={saveProduct} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium flex items-center gap-2 disabled:opacity-50"><Check className="w-4 h-4" />{productSaving ? "Salvando..." : photoBusy ? "Preparando foto..." : editingProduct?"Salvar Alterações":"Adicionar Produto"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5"><Trash2 className="w-8 h-8 text-red-500" /></div>
              <h2 className="text-xl font-bold mb-3" style={{fontFamily:"Poppins,sans-serif"}}>Excluir Produto</h2>
              <p className="text-muted-foreground mb-8">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 font-medium">Cancelar</button>
                <button onClick={() => deleteProd(deleteId)} className="flex-1 py-3 bg-destructive text-white rounded-xl hover:bg-destructive/90 font-medium flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Modelo Físico BD ─────────────────────────────────────────────────────

  const DBModelScreen = () => {
    type FieldKey = "PK" | "PK/FK" | "FK" | "";
    interface Field { name: string; type: string; key: FieldKey; ref?: string; }
    interface TableDef { name: string; fields: Field[]; group: string; }

    const tables: TableDef[] = [
      {
        name: "PESSOA", group: "Usuários",
        fields: [
          { name: "id_usuario",   type: "INT",          key: "PK" },
          { name: "nome",         type: "VARCHAR(150)",  key: "" },
          { name: "email",        type: "VARCHAR(200)",  key: "" },
          { name: "senha_hash",   type: "VARCHAR(255)",  key: "" },
          { name: "telefone",     type: "VARCHAR(25)",   key: "" },
          { name: "tipo_perfil",  type: "VARCHAR(20)",   key: "",  ref: "cliente | vendedor | administrador" },
          { name: "id_endereco",  type: "INT",           key: "FK", ref: "ENDERECO.id_endereco" },
          { name: "created_at",   type: "DATETIME",      key: "" },
        ],
      },
      {
        name: "ENDERECO", group: "Usuários",
        fields: [
          { name: "id_endereco",  type: "INT",          key: "PK" },
          { name: "logradouro",   type: "VARCHAR(200)",  key: "" },
          { name: "numero",       type: "VARCHAR(10)",   key: "" },
          { name: "complemento",  type: "VARCHAR(100)",  key: "" },
          { name: "bairro",       type: "VARCHAR(100)",  key: "" },
          { name: "cidade",       type: "VARCHAR(100)",  key: "" },
          { name: "estado",       type: "CHAR(2)",       key: "" },
          { name: "cep",          type: "VARCHAR(10)",   key: "" },
        ],
      },
      {
        name: "CLIENTE", group: "Usuários",
        fields: [
          { name: "id_cliente",   type: "INT", key: "PK/FK", ref: "PESSOA.id_usuario" },
          { name: "data_cadastro",type: "DATETIME",     key: "" },
        ],
      },
      {
        name: "VENDEDOR", group: "Usuários",
        fields: [
          { name: "id_vendedor",  type: "INT", key: "PK/FK", ref: "PESSOA.id_usuario" },
          { name: "data_cadastro",type: "DATETIME",     key: "" },
        ],
      },
      {
        name: "ADMINISTRADOR", group: "Usuários",
        fields: [
          { name: "id_admin",     type: "INT", key: "PK/FK", ref: "PESSOA.id_usuario" },
          { name: "data_acesso",  type: "DATETIME",     key: "" },
        ],
      },
      {
        name: "CATEGORIA", group: "Produtos",
        fields: [
          { name: "id_categoria",      type: "INT",          key: "PK" },
          { name: "nome_categoria",    type: "VARCHAR(80)",   key: "" },
          { name: "descricao_categoria", type: "TEXT",        key: "" },
          { name: "created_at",        type: "DATETIME",      key: "" },
        ],
      },
      {
        name: "PRODUTO", group: "Produtos",
        fields: [
          { name: "id_produto",   type: "INT",           key: "PK" },
          { name: "nome",         type: "VARCHAR(150)",   key: "" },
          { name: "descricao",    type: "TEXT",           key: "" },
          { name: "preco",        type: "DECIMAL(10,2)",  key: "" },
          { name: "estado",       type: "VARCHAR(100)",   key: "" },
          { name: "foto",         type: "VARCHAR(255)",   key: "" },
          { name: "status",       type: "VARCHAR(30)",    key: "", ref: "disponível|reservado|vendido|indisponível" },
          { name: "id_categoria", type: "INT",            key: "FK", ref: "CATEGORIA.id_categoria" },
          { name: "id_vendedor",  type: "INT",            key: "FK", ref: "VENDEDOR.id_vendedor" },
          { name: "created_at",   type: "DATETIME",       key: "" },
        ],
      },
      {
        name: "COMPRA", group: "Transações",
        fields: [
          { name: "id_compra",    type: "INT",           key: "PK" },
          { name: "data_compra",  type: "DATETIME",      key: "" },
          { name: "valor_total",  type: "DECIMAL(10,2)", key: "" },
          { name: "status",       type: "VARCHAR(30)",   key: "", ref: "Pendente|Confirmada|Finalizada|Cancelada" },
          { name: "id_cliente",   type: "INT",           key: "FK", ref: "CLIENTE.id_cliente" },
          { name: "id_whatsapp",  type: "INT",           key: "FK", ref: "WHATSAPP.id_whatsapp" },
        ],
      },
      {
        name: "ITEM", group: "Transações",
        fields: [
          { name: "id_item",      type: "INT",           key: "PK" },
          { name: "quantidade",   type: "INT",           key: "" },
          { name: "valor_unit",   type: "DECIMAL(10,2)", key: "" },
          { name: "subtotal",     type: "DECIMAL(10,2)", key: "", ref: "quantidade × valor_unit" },
          { name: "id_compra",    type: "INT",           key: "FK", ref: "COMPRA.id_compra" },
          { name: "id_produto",   type: "INT",           key: "FK", ref: "PRODUTO.id_produto" },
        ],
      },
      {
        name: "WHATSAPP", group: "Transações",
        fields: [
          { name: "id_whatsapp",     type: "INT",          key: "PK" },
          { name: "numero",          type: "VARCHAR(25)",   key: "" },
          { name: "mensagem_padrao", type: "TEXT",          key: "" },
        ],
      },
      {
        name: "RELATORIO_VENDAS", group: "Relatórios",
        fields: [
          { name: "id_relatorio_vendas", type: "INT",      key: "PK" },
          { name: "data_geracao",        type: "DATETIME", key: "" },
          { name: "tipo",                type: "VARCHAR(50)", key: "" },
          { name: "id_admin",            type: "INT",      key: "FK", ref: "ADMINISTRADOR.id_admin" },
        ],
      },
      {
        name: "RELATORIO_GERAL", group: "Relatórios",
        fields: [
          { name: "id_relatorio_geral",  type: "INT",      key: "PK" },
          { name: "data_geracao",        type: "DATETIME", key: "" },
          { name: "tipo",                type: "VARCHAR(50)", key: "" },
          { name: "id_admin",            type: "INT",      key: "FK", ref: "ADMINISTRADOR.id_admin" },
        ],
      },
    ];

    const relationships = [
      { from:"PESSOA",        fk:"id_endereco",        to:"ENDERECO",        pk:"id_endereco",            card:"1 : 1",  desc:"Uma pessoa possui um endereço" },
      { from:"CLIENTE",       fk:"id_cliente",         to:"PESSOA",          pk:"id_usuario",             card:"1 : 1",  desc:"Cliente é especialização de Pessoa (herança)" },
      { from:"VENDEDOR",      fk:"id_vendedor",        to:"PESSOA",          pk:"id_usuario",             card:"1 : 1",  desc:"Vendedor é especialização de Pessoa (herança)" },
      { from:"ADMINISTRADOR", fk:"id_admin",           to:"PESSOA",          pk:"id_usuario",             card:"1 : 1",  desc:"Administrador é especialização de Pessoa (herança)" },
      { from:"PRODUTO",       fk:"id_categoria",       to:"CATEGORIA",       pk:"id_categoria",           card:"N : 1",  desc:"Vários produtos pertencem a uma categoria" },
      { from:"PRODUTO",       fk:"id_vendedor",        to:"VENDEDOR",        pk:"id_vendedor",            card:"N : 1",  desc:"Vários produtos são gerenciados por um vendedor" },
      { from:"COMPRA",        fk:"id_cliente",         to:"CLIENTE",         pk:"id_cliente",             card:"N : 1",  desc:"Um cliente realiza várias compras" },
      { from:"COMPRA",        fk:"id_whatsapp",        to:"WHATSAPP",        pk:"id_whatsapp",            card:"N : 1",  desc:"Compra gera comunicação via WhatsApp (sistema externo)" },
      { from:"ITEM",          fk:"id_compra",          to:"COMPRA",          pk:"id_compra",              card:"N : 1",  desc:"Uma compra possui vários itens" },
      { from:"ITEM",          fk:"id_produto",         to:"PRODUTO",         pk:"id_produto",             card:"N : 1",  desc:"Vários itens referenciam um produto" },
      { from:"RELATORIO_VENDAS", fk:"id_admin",        to:"ADMINISTRADOR",   pk:"id_admin",               card:"N : 1",  desc:"Administrador gera vários relatórios de vendas" },
      { from:"RELATORIO_GERAL",  fk:"id_admin",        to:"ADMINISTRADOR",   pk:"id_admin",               card:"N : 1",  desc:"Administrador gera vários relatórios gerais" },
    ];

    const groups = ["Usuários","Produtos","Transações","Relatórios"];
    const groupColors: Record<string,string> = {
      "Usuários":   "border-blue-400",
      "Produtos":   "border-emerald-400",
      "Transações": "border-amber-400",
      "Relatórios": "border-purple-400",
    };
    const groupHeaderColors: Record<string,string> = {
      "Usuários":   "bg-blue-900/60",
      "Produtos":   "bg-emerald-900/60",
      "Transações": "bg-amber-900/60",
      "Relatórios": "bg-purple-900/60",
    };
    const groupLabelColors: Record<string,string> = {
      "Usuários":   "text-blue-300",
      "Produtos":   "text-emerald-300",
      "Transações": "text-amber-300",
      "Relatórios": "text-purple-300",
    };

    const keyBadge = (key: FieldKey) => {
      if (key === "PK")    return <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[10px] font-bold rounded">PK</span>;
      if (key === "PK/FK") return <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-blue-400 text-black text-[10px] font-bold rounded">PK/FK</span>;
      if (key === "FK")    return <span className="px-1.5 py-0.5 bg-blue-400 text-black text-[10px] font-bold rounded">FK</span>;
      return null;
    };

    return (
      <div className="min-h-screen" style={{ background: "#0d1b2e", fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <div className="border-b border-white/10" style={{ background: "linear-gradient(135deg,#0f2a5a,#163E8F,#1a4aab)" }}>
          <div className="max-w-screen-2xl mx-auto px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0"><Heart className="w-5 h-5 text-primary fill-primary" /></div>
                  <span className="text-white/70 text-sm font-medium tracking-widest uppercase">Casa Azul — Bazar Solidário</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif", letterSpacing: "-0.02em" }}>
                  MODELO FÍSICO — BANCO DE DADOS
                </h1>
                <p className="text-white/60 mt-2 text-sm">Documentação Acadêmica · Vitrine Digital · Baseado no Diagrama de Classes e Casos de Uso</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { color:"bg-amber-400", label:"PK — Chave Primária" },
                  { color:"bg-blue-400",  label:"FK — Chave Estrangeira" },
                  { color:"bg-gradient-to-r from-amber-400 to-blue-400", label:"PK/FK — Herança (Especialização)" },
                ].map((l,i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded flex-shrink-0 ${l.color}`} />
                    <span className="text-white/80 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Groups legend */}
            <div className="flex flex-wrap gap-3 mt-6">
              {groups.map(g => (
                <span key={g} className={`px-3 py-1 rounded-full text-xs font-semibold border ${groupLabelColors[g]} ${groupColors[g]} bg-white/5`}>{g}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tables by group */}
        <div className="max-w-screen-2xl mx-auto px-8 py-10 space-y-12">
          {groups.map(group => {
            const groupTables = tables.filter(t => t.group === group);
            return (
              <div key={group}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-xs font-bold uppercase tracking-widest ${groupLabelColors[group]}`}>{group}</span>
                  <div className={`flex-1 h-px ${groupColors[group].replace("border-","bg-")}`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {groupTables.map(table => (
                    <div key={table.name} className={`rounded-xl border-2 overflow-hidden ${groupColors[table.group]}`} style={{ background: "#112240" }}>
                      {/* Table header */}
                      <div className={`px-4 py-3 ${groupHeaderColors[table.group]} border-b border-white/10`}>
                        <h3 className="font-bold text-white tracking-wider text-sm" style={{ fontFamily: "monospace" }}>{table.name}</h3>
                      </div>
                      {/* Column headers */}
                      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 border-b border-white/10 bg-white/5">
                        {["Campo","Tipo","Chave"].map(h => (
                          <span key={h} className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{h}</span>
                        ))}
                      </div>
                      {/* Fields */}
                      <div className="divide-y divide-white/5">
                        {table.fields.map((f, fi) => {
                          const isPK = f.key === "PK" || f.key === "PK/FK";
                          const isFK = f.key === "FK" || f.key === "PK/FK";
                          return (
                            <div key={fi} className={`grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-4 py-2 transition-colors ${isPK ? "bg-amber-400/5" : isFK ? "bg-blue-400/5" : "hover:bg-white/3"}`}>
                              <div>
                                <span className={`font-mono text-xs ${isPK ? "text-amber-300 font-semibold" : isFK ? "text-blue-300" : "text-white/80"}`}>{f.name}</span>
                                {f.ref && <p className="text-white/30 text-[9px] leading-tight mt-0.5 truncate">{f.ref}</p>}
                              </div>
                              <span className="font-mono text-[10px] text-white/50 text-right whitespace-nowrap">{f.type}</span>
                              <div className="flex justify-end">{keyBadge(f.key)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Relationships table */}
        <div className="max-w-screen-2xl mx-auto px-8 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Relacionamentos e Cardinalidades</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#112240" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {["Tabela Origem","Campo FK","→","Tabela Destino","Campo PK","Cardinalidade","Descrição"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-white/40 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {relationships.map((r, i) => (
                    <tr key={i} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3"><span className="font-mono text-amber-300 text-xs font-semibold">{r.from}</span></td>
                      <td className="px-4 py-3"><span className="font-mono text-blue-300 text-xs">{r.fk}</span></td>
                      <td className="px-4 py-3 text-white/30 text-center">→</td>
                      <td className="px-4 py-3"><span className="font-mono text-amber-300 text-xs font-semibold">{r.to}</span></td>
                      <td className="px-4 py-3"><span className="font-mono text-amber-200 text-xs">{r.pk}</span></td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full border text-xs font-bold border-white/20 text-white/70 bg-white/5 whitespace-nowrap">{r.card}</span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cardinalidades summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { card:"PESSOA 1:1 ENDEREÇO",            detail:"Uma pessoa tem um endereço" },
              { card:"PESSOA 1:N COMPRA",               detail:"Um cliente realiza várias compras" },
              { card:"COMPRA 1:N ITEM",                 detail:"Uma compra possui vários itens" },
              { card:"ITEM N:1 PRODUTO",                detail:"Vários itens referenciam um produto" },
              { card:"CATEGORIA 1:N PRODUTO",           detail:"Uma categoria agrupa vários produtos" },
              { card:"VENDEDOR 1:N PRODUTO",            detail:"Um vendedor gerencia vários produtos" },
              { card:"ADMINISTRADOR 1:N REL. VENDAS",   detail:"Admin gera vários relatórios de vendas" },
              { card:"ADMINISTRADOR 1:N REL. GERAL",    detail:"Admin gera vários relatórios gerais" },
            ].map((c,i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/3">
                <p className="font-mono text-white/80 text-xs font-semibold mb-1">{c.card}</p>
                <p className="text-white/40 text-[11px]">{c.detail}</p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-10 p-5 rounded-xl border border-white/10 bg-white/3 flex flex-col sm:flex-row sm:items-center gap-4">
            <Shield className="w-8 h-8 text-white/30 flex-shrink-0" />
            <div>
              <p className="text-white/60 text-xs leading-relaxed">
                <strong className="text-white/80">Nota acadêmica:</strong> Este modelo físico foi derivado do Diagrama de Classes e do Diagrama de Casos de Uso do projeto
                "Vitrine Digital – Bazar Solidário Casa Azul". A herança (generalização/especialização) de PESSOA para CLIENTE, VENDEDOR e ADMINISTRADOR
                foi implementada via <span className="font-mono text-amber-300/80">PK/FK</span> compartilhada. A entidade WHATSAPP representa
                exclusivamente a integração com sistema externo, sem tratar o WhatsApp como usuário do sistema.
                Tipos de dados seguem o padrão SQL relacional (INT, VARCHAR, TEXT, DECIMAL, DATETIME).
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setCurrentScreen("home")} className="text-white/30 hover:text-white/60 text-xs transition-colors flex items-center gap-2 mx-auto">
              <ChevronRight className="w-4 h-4 rotate-180" /> Voltar ao Protótipo
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Router ────────────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (currentScreen) {
      case "home": return <HomeScreen />;
      case "catalog": return <CatalogScreen />;
      case "product-detail": return <ProductDetailScreen />;
      case "cart": return <CartScreen />;
      case "checkout": return <CheckoutScreen />;
      case "order-confirmation": return <OrderConfirmationScreen />;
      case "confirm-reservation": return <ConfirmReservationScreen />;
      case "confirmation": return <ConfirmationScreen />;
      case "about": return <AboutScreen />;
      case "contact": return <ContactScreen />;
      case "login": return <LoginScreen />;
      case "register": return <RegisterScreen />;
      case "password-recovery": return <PasswordRecoveryScreen />;
      case "admin-login": return <AdminLoginScreen />;
      case "admin": return isAdminLoggedIn ? <AdminScreen /> : <AdminLoginScreen />;
      case "db-model": return <DBModelScreen />;
      case "profile": return isLoggedIn ? <ProfileScreen /> : <LoginScreen />;
      case "my-reservations": return isLoggedIn ? <MyReservationsScreen /> : <LoginScreen />;
      case "purchase-history": return isLoggedIn ? <PurchaseHistoryScreen /> : <LoginScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen" onClick={() => { if (userMenuOpen) setUserMenuOpen(false); }}>
      <Toaster position="bottom-right" richColors />
      {renderScreen()}
    </div>
  );
}
