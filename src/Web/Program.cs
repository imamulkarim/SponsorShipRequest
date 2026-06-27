using Scalar.AspNetCore;
using TechAssessment.Infrastructure.Data;
using TechAssessment.Shared;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Stop using .NET Aspire services: service discovery, resilience, health checks, and OpenTelemetry.
builder.AddServiceDefaults();

//builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

//builder.Services.AddSwaggerGen(options =>
//{
//    options.SwaggerDoc("v1", new()
//    {
//        Title = "Clean Architecture API",
//        Version = "v1",
//        Description = "Demo Clean Architecture API"
//    });
//});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();

    //app.UseSwagger();
    //app.UseSwaggerUI();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors(static builder => 
    builder.AllowAnyMethod()
        .AllowAnyHeader()
        .AllowAnyOrigin());

app.UseFileServer();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseExceptionHandler(options => { });

// Stop using .NET Aspire services:
app.MapDefaultEndpoints();
app.MapEndpoints(typeof(Program).Assembly);

app.MapFallbackToFile("index.html");


app.Run();
