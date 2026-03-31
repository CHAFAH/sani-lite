/*
 * Performance — Performance reviews and goal tracking
 * Design: Warm Machine / Organic Modernism
 */

import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Target, Star, TrendingUp, Users } from "lucide-react";
import { performanceReviews } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-gray-50 text-gray-600 border-gray-200",
};

const perfStats = [
  { label: "Avg. Rating", value: "4.4", icon: Star, color: "bg-amber-50 text-amber-600" },
  { label: "Reviews Done", value: "5/8", icon: Target, color: "bg-teal-50 text-teal-600" },
  { label: "Goals On Track", value: "78%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
  { label: "Reviewers Active", value: "4", icon: Users, color: "bg-purple-50 text-purple-600" },
];

export default function AppPerformance() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Performance</h1>
          <p className="text-muted-foreground text-sm mt-1">Q1 2026 review cycle — track goals and reviews</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {perfStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={18} />
              </div>
              <p className="text-2xl font-semibold font-sans">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Reviews grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h3 className="text-lg font-semibold font-sans mb-4">Performance Reviews</h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {performanceReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold">{review.employee}</p>
                    <p className="text-xs text-muted-foreground">{review.department}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[review.status]}`}>
                    {review.status}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= Math.round(review.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{review.rating}</span>
                </div>

                {/* Goals progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Goals completed</span>
                    <span className="font-medium">{review.goalsCompleted}/{review.goals}</span>
                  </div>
                  <Progress
                    value={(review.goalsCompleted / review.goals) * 100}
                    className="h-2 bg-cream-dark"
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Reviewed by <span className="font-medium text-foreground">{review.reviewer}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{review.cycle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
