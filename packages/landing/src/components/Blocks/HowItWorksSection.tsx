import { SITE_CONTENT } from "@challenger-fantasy/core";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Join a Lobby",
    description: "Pick a 2, 3, or 4 person lobby for an upcoming event.",
  },
  {
    number: 2,
    title: "Snake Draft",
    description: "Take turns picking dominant fighters to build your team.",
  },
  {
    number: 3,
    title: "Watch & Score",
    description: "Fighters earn points for KOs, early finishes, strikes landed, and more.",
  },
  {
    number: 4,
    title: "Win",
    description: "Outscore your opponents to claim victory.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {SITE_CONTENT.LANDING.HOW_IT_WORKS_TITLE}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {SITE_CONTENT.LANDING.HOW_IT_WORKS_SUBTEXT}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 h-px bg-border left-[calc(50%+1.25rem)] right-[calc(-50%-0.75rem)]" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center text-sm font-bold mb-5 shrink-0">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { HowItWorksSection };
