"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/Button";
import { updateQuote } from "./action";

// 🚀 SHADCN UI IMPORTLARI (Dosya yollarını kendi projene göre kontrol et)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 

const Categories = ["Life", "Health", "Motivation", "Wisdom"];

export default function EditQuoteForm({ 
  quoteId, 
  defaultQuote, 
  defaultAuthor,
  defaultCategory
}: { 
  quoteId: string; 
  defaultQuote: string; 
  defaultAuthor: string;
  defaultCategory: string | string[];
}) {
  const updateQuoteWithId = updateQuote.bind(null, quoteId);
  
  // Hata state'ini yakalamak için React hook'u kullanıyoruz
  const [state, formAction] = useFormState(updateQuoteWithId, null);

  // Eski verileri güvenli bir şekilde diziye (array) çeviriyoruz
  const categoryArray = Array.isArray(defaultCategory) 
    ? defaultCategory 
    : (defaultCategory ? [defaultCategory] : []);

  return (
    <form
      action={formAction}
      className="bg-base-100 p-8 md:p-10 rounded-md shadow-xl flex flex-col gap-6 w-full max-w-lg border border-base-content/20"
    >
      <h2 className="text-2xl font-bold text-center text-primary">
        Edit Your Quote
      </h2>

      {/* EĞER SUNUCUDAN HATA GELİRSE BURADA KIRMIZI KUTU İÇİNDE GÖSTERİLECEK */}
      {state?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="author" className="font-semibold">Author</label>
        <input
          type="text"
          name="author"
          id="author"
          required
          defaultValue={defaultAuthor}
          className="input input-bordered"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="quote" className="font-semibold">Quote Text</label>
        <textarea
          name="quote"
          id="quote"
          required
          defaultValue={defaultQuote}
          className="textarea textarea-bordered h-28 resize-none text-base"
        />
      </div>

      {/* 🚀 SHADCN UI ILE KATEGORI SEÇIMI */}
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="font-semibold">Category</label>
        <Select 
          name="category" 
          defaultValue={categoryArray[0] || ""} // Veritabanındaki ilk kategoriyi seçili getirir
        >
          <SelectTrigger 
            id="category" 
            className="w-full bg-base-100 border-base-content/20 focus:ring-primary h-12"
          >
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-base-100 shadow-xl z-50 border border-base-content/20">
            {Categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 md:mt-4 flex flex-col gap-4">
        <Button type="submit" variant={"primary"} className="w-full">
          Save Changes
        </Button>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center py-2 text-sm font-semibold bg-slate-300/90 text-slate-700 hover:opacity-70 rounded-md transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}