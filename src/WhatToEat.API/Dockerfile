# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["WhatToEat.API.csproj", "./"]
RUN dotnet restore "WhatToEat.API.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "WhatToEat.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WhatToEat.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "WhatToEat.API.dll"]
