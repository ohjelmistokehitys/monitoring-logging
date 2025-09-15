import sys
from tests import check, line

result = sys.stdin.read()
print(result)

line()

check("name" in result and "services" in result,
      "The compose file must be valid")

check("postgres" in result, "postgres service must be defined in the compose file")
check("pgadmin" in result, "pgadmin service must be defined in the compose file")

check("environment" in result,
      "You must define environment files for both of the services")

check("datasaurus_rex@example.com" in result,
      "Could not find the environment variable for the pgadmin username")


print("Success!")
