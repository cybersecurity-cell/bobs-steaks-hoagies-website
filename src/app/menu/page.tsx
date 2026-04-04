"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MENU_ITEMS, MENU_CATEGORIES, RESTAURANT_INFO, type MenuItem } from "@/lib/menu-data";
import MenuCard from "@/components/MenuCard";
import { useCart } from "@/lib/cart-context";

const FULL_MENU_SECTIONS = [
  { title: "Fresh Cut Rib-Eye Steaks", icon: "🥩", items: [
    { name: "Regular Steak", price: "$14.00" },{ name: "Cheese Steak", price: "$15.00" },
    { name: "Pepper Steak", price: "$15.00" },{ name: "Pepper Cheese Steak", price: "$16.00" },
    { name: "Mushroom Cheese Steak", price: "$16.00" },{ name: "Steak Hoagie", price: "$15.00" },
    { name: "Cheese Steak Hoagie", price: "$16.00" },
    { name: "Pizza Steak with Sauce and Sharp Provolone Cheese", price: "$16.00" },
  ]},
  { title: "Chicken Steaks", icon: "🍗", items: [
    { name: "Chicken Steak", price: "$14.00" },{ name: "Chicken Cheese Steak", price: "$15.00" },
    { name: "Chicken Pepper Steak", price: "$15.00" },{ name: "Chicken Pepper Cheese Steak", price: "$16.00" },
    { name: "Mushroom Chicken Steak", price: "$15.00" },{ name: "Mushroom Chicken Cheese Steak", price: "$16.00" },
    { name: "Chicken Steak Hoagie", price: "$15.00" },{ name: "Chicken Cheese Steak Hoagie", price: "$16.00" },
    { name: "Chicken Pizza Steak with Sauce and Provolone Cheese", price: "$16.00" },
    { name: "Buffalo Chicken Cheese Steak", price: "$16.00" },
  ]},
  { title: "Fresh Cut Hoagies", icon: "🥖", items: [
    { name: "London Roast Beef and Cheese", price: "$12.90" },{ name: "Corn Beef and Cheese", price: "$12.90" },
    { name: "Cajun Turkey and Cheese", price: "$11.00" },{ name: "Turkey Ham", price: "$10.15" },
    { name: "Gourmet Turkey", price: "$10.15" },{ name: "Buffalo Chicken", price: "$10.15" },
    { name: "Italian Tuna", price: "$11.20" },{ name: "Tuna", price: "$11.20" },
    { name: "Chicken Salad", price: "$11.20" },{ name: "Honey Barbecue Chicken Breast", price: "$13.50" },
    { name: "Cheese Hoagie", price: "$9.20" },{ name: "Beef Pastrami", price: "$13.90" },
    { name: "Maple Honey Turkey", price: "$13.90" },{ name: "Pepper Turkey", price: "$13.50" },
  ]},
  { title: "Corn Beef Panini", icon: "🥪", items: [
    { name: "Corn Beef with Coleslaw and Special Sauce on Rye Bread", price: "" },
  ]},
  { title: "Jews Deluxe", icon: "⭐", items: [
    { name: "Roast Beef, Corned Beef and Gourmet Turkey with Swiss Cheese", price: "" },
  ]},
  { title: "Italian", icon: "🇮🇹", items: [
    { name: "Genoa Salami, Cotegina, Hot Capicola, Imported Ham and Mild Provolone", price: "" },
  ]},
  { title: "Ham and Cheese", icon: "🧀", items: [
    { name: "Imported Ham with Cheese of Your Choice", price: "" },
  ]},
  { title: "Fresh Cut Vegan Hoagies", icon: "🌱", items: [
    { name: "Vegan Roasted Turkey", price: "$15.90" },{ name: "Vegan Pepper Turkey", price: "$15.90" },
    { name: "Vegan Smoked Turkey", price: "$15.90" },
  ]},
  { title: "100% Homemade Burger", icon: "🍔", items: [
    { name: "Regular Burger", price: "$5.00" },{ name: "Cheeseburger", price: "$6.00" },
    { name: "Mushroom Burger", price: "$6.00" },{ name: "Mushroom Cheeseburger", price: "$7.00" },
    { name: "Pizza Burger", price: "$6.00" },{ name: "Pepper Burger", price: "$5.00" },
    { name: "Pepper Cheeseburger", price: "$6.00" },
  ]},
  { title: "French Fries", icon: "🍟", items: [
    { name: "French Fries", price: "$4.00" },{ name: "Cheese Fries", price: "$6.00" },
  ]},
  { title: "Dessert", icon: "🍰", items: [
    { name: "Pound Cake", price: "$5.50" },{ name: "Chocolate Cake", price: "$5.59" },
    { name: "Strawberry Cake", price: "$5.50" },{ name: "BOBs Cheesecake Cups", price: "$6.00" },
    { name: "Lemon Cake", price: "$5.50" },{ name: "Banana Pudding", price: "$6.50" },
  ]},
  { title: "Beverage", icon: "🥤", items: [
    { name: "Soda", price: "" },{ name: "Water", price: "" },{ name: "Homemade Ice Tea", price: "" },
  ]},
];

const FREE_TOPPINGS = ["Fried Onions","Raw Onions","Marinara Sauce","Crushed Hot Peppers","Ketchup","Mayonnaise","Sweet Peppers","Banana Peppers","Salt/Pepper","Mustard"];
const CHEESE_OPTIONS = [
  {name:"Provolone Cheese",price:""},{name:"American Cheese",price:""},{name:"Cheddar Cheese",price:""},
  {name:"Swiss Cheese",price:""},{name:"Cooper Sharp",price:""},{name:"Feta Cheese",price:""},
  {name:"Lettuce",price:""},{name:"Tomatoes",price:""},{name:"Onions",price:""},
  {name:"Cheese Whiz",price:"$1.00"},{name:"Sharp Provolone",price:"$1.00"},
  {name:"Extra Provolone",price:"$3.00"},{name:"Extra Cheese Whiz",price:"$3.00"},
  {name:"All 3 Cheeses",price:"$4.00"},{name:"Pepper Jack",price:"$1.00"},
  {name:"Banana Peppers",price:""},{name:"Sweet Peppers",price:""},{name:"Hot Peppers",price:""},
  {name:"Hot Seeds Pickles",price:""},{name:"Extra Vinegar Oil",price:""},
  {name:"Red Wine Vinegar",price:""},{name:"Oregano",price:""},
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("steaks");
  const [showFullMenu, setShowFullMenu] = useState(false);

  // ── Cart from global context ──
  const { addItem } = useCart();

  const filteredItems = MENU_ITEMS.filter((i) => i.category === activeCategory);

  const handleAdd = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1400&auto=format&fit=crop&q=80"
          alt="Menu" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Our Menu</h1>
            <p className="text-gray-300 text-base">100% Grass-Fed · Always Made to Order</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Full menu accordion */}
        <div className="mb-10">
          <button onClick={() => setShowFullMenu(!showFullMenu)}
            className="w-full flex items-center justify-between bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg">
            <span className="flex items-center gap-3"><span className="text-2xl">📋</span><span>View Complete Menu</span></span>
            {showFullMenu ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          {showFullMenu && (
            <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
              <div className="bg-[#C41230] text-white text-center py-8 px-4">
                <div className="text-5xl mb-3">🐂</div>
                <h2 className="text-3xl font-black tracking-wide">BOB&apos;S STEAKS AND HOAGIES</h2>
                <p className="text-red-200 mt-1 font-medium">North Philadelphia&apos;s Finest Cheesesteaks</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {FULL_MENU_SECTIONS.map((section) => (
                  <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      <h3 className="font-bold text-sm tracking-wide uppercase">{section.title}</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {section.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700 text-sm leading-snug">{item.name}</span>
                          {item.price && <span className="text-[#C41230] font-bold text-sm whitespace-nowrap ml-2">{item.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">🧅</span>
                    <h3 className="font-bold text-sm tracking-wide uppercase">Steak Free Options</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {FREE_TOPPINGS.map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
                  <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">🧀</span>
                    <h3 className="font-bold text-sm tracking-wide uppercase">Cheese Options and Extra Toppings</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-[#C41230] font-bold text-sm mb-3">Extra Toppings — $1.50 each</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {CHEESE_OPTIONS.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 text-xs">{c.name}</span>
                          {c.price && <span className="text-[#C41230] text-xs font-bold ml-1">{c.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-300 text-center py-4 px-4 text-sm">
                <span className="font-semibold text-white">Call to Order:</span> {RESTAURANT_INFO.phone}
                <span className="mx-3 text-gray-600">·</span>Prices subject to change without notice
              </div>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {MENU_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-[#C41230] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* Menu grid — MenuCard calls handleAdd which pushes to global CartContext */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>

        {/* Delivery apps */}
        <div className="mt-16 border-t border-gray-100 pt-12 text-center">
          <p className="text-gray-500 mb-4 font-medium">Also order from your favorite delivery app</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              {name:"DoorDash",url:RESTAURANT_INFO.social.doordash,color:"bg-red-500"},
              {name:"GrubHub",url:RESTAURANT_INFO.social.grubhub,color:"bg-orange-500"},
              {name:"Uber Eats",url:RESTAURANT_INFO.social.ubereats,color:"bg-green-600"},
            ].map((app) => (
              <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer"
                className={`${app.color} text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity`}>
                {app.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
