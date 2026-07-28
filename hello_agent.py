from uagents import Agent, Context

agent = Agent(name="hello_agent", seed="hello_agent_seed_phrase")

@agent.on_event("startup")
async def say_hello(ctx: Context):
    ctx.logger.info(f"Hello! My agent address is {agent.address}")

if __name__ == "__main__":
    agent.run()