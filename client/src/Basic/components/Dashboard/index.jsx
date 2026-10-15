import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useState } from "react";
import {
  IndianRupee,
  PieChart,
  TrendingUp,
  UserCheck,
  UsersRound,
} from "lucide-react";
import secureLocalStorage from "react-secure-storage";

import { Login } from "../../pages";
export default function Form() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  );

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  );

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [12000, 19000, 3000, 5000, 2000, 3000],
        backgroundColor: "#5CB338",
      },
    ],
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: [50, 70, 80, 60, 90, 100],
        fill: false,
        borderColor: "#5CB338",
      },
    ],
  };

  // Dummy data for the table (e.g., top products)
  const dummyProducts = [
    { id: 1, name: "Product A", sales: 120 },
    { id: 2, name: "Product B", sales: 80 },
    { id: 3, name: "Product C", sales: 150 },
  ];

  //doughnut chart
  const [chatData] = useState({
    labels: ["Messages", "Users", "Active Chats", "Archived", "Pending"],
    datasets: [
      {
        data: [700, 150, 100, 300, 150],
        backgroundColor: [
          "#6366F1",
          "#22C55E",
          "#F97316",
          "#EC4899",
          "#8B5CF6",
        ],
        borderColor: ["#6366F1", "#22C55E", "#F97316", "#EC4899", "#8B5CF6"],
        borderWidth: 1,
      },
    ],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        display: true,
        labels: {
          boxWidth: 10,
          boxHeight: 5,
          padding: 12,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        padding: 10,
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 14,
        },
      },
    },
    cutout: "65%",
  };

  const data2 = {
    labels: ["Jan", "Feb", "Mar", "April", "May"],
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56],
        // backgroundColor: "#48BD16",
        backgroundColor: "#5DADE2",

        border: "none",
      },
    ],
  };

  const options2 = {
    indexAxis: "y",
    responsive: true,

    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        categoryPercentage: 0.6,
        barPercentage: 0.8,
      },
    },
  };

  const cardsData = [
    {
      label: "Revenue",
      value: "$2500",
      logo: <IndianRupee size={50} color={"#30b5fc "} />,
      increase: true,
      percentage: "5%",
    },
    {
      label: "Increase",
      value: "15%",
      logo: <TrendingUp size={50} color={"#399918"} />,
      increase: true,
      percentage: "15%",
    },
    {
      label: "Users",
      value: 150,
      logo: <UsersRound size={50} color={"#FF885B "} />,
      increase: true,
      percentage: "10%",
    },
    {
      label: "Manufacturers ",
      value: 50,
      logo: <UserCheck size={50} color={"#BE5985"} />,
      increase: true,
      percentage: "10%",
    },
    {
      label: "Vendors",
      value: 100,
      logo: <UserCheck size={50} color={"grey"} />,
      increase: true,
      percentage: "10%",
    },
  ];

  return (
    <>

    </>
  );
}
