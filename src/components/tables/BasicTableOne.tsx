"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { DataTable, type DataTableColumn } from "@/shared/components/table";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];

export default function BasicTableOne() {
  const columns: DataTableColumn<Order>[] = [
    {
      key: "user",
      header: "User",
      className: "px-5 py-4 sm:px-6",
      render: (order) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              src={order.user.image}
              alt={order.user.name}
            />
          </div>
          <div>
            <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
              {order.user.name}
            </span>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {order.user.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "projectName",
      header: "Project Name",
      accessor: (order) => order.projectName,
    },
    {
      key: "team",
      header: "Team",
      render: (order) => (
        <div className="flex -space-x-2">
          {order.team.images.map((teamImage, index) => (
            <div
              key={`${order.id}-team-${index}`}
              className="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-gray-900"
            >
              <Image
                width={24}
                height={24}
                src={teamImage}
                alt={`Team member ${index + 1}`}
                className="w-full"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge
          size="sm"
          color={
            order.status === "Active"
              ? "success"
              : order.status === "Pending"
                ? "warning"
                : "error"
          }
        >
          {order.status}
        </Badge>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      accessor: (order) => order.budget,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <DataTable<Order>
            data={tableData}
            columns={columns}
            rowKey={(order) => order.id.toString()}
            emptyState="Aucun projet disponible"
          />
        </div>
      </div>
    </div>
  );
}
