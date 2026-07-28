from uagents import Agent, Context

agent = Agent(
    name="orchestrator",
    seed="orchestrator_seed_change_me",
    port=8000,
    endpoint=["http://127.0.0.1:8000/submit"],
)

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Orchestrator started: {agent.address}")

if __name__ == "__main__":
    agent.run()