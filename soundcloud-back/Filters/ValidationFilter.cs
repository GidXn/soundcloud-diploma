using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using FluentValidation.Results;
using System.Linq;                 
using System.Collections.Generic;  


namespace soundcloud_back.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // aggregate all errors across all arguments and don't use reflection
        //Get the ServiceProvider once (not on every iteration)
        var sp = context.HttpContext.RequestServices;
        // collect errors across all action arguments. Key: model property name, value: list of messages
        var aggregatedErrors = new Dictionary<string, List<string>>();
                
        foreach (var argument in context.ActionArguments.Values) // Iterate over all action arguments
        {
            if (argument == null) continue;// Skip null arguments

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType()); // As before: look for IValidator<T> for the actual argument type
            var validatorObj = sp.GetService(validatorType);// Get the validator from DI, but do NOT call it via reflection. Instead, safely cast to IValidator and use ValidationContext<object>.
            //if (validatorObj is null) continue;
            ////var validator = context.HttpContext.RequestServices.GetService(validatorType);

            //var validator = (IValidator)validatorObj; //

            //// guaranteed to work on any version FluentValidation
            //ValidationResult result = await validator.ValidateAsync(new ValidationContext<object>(argument));

            if (validatorObj is not null)
            {
                var validator = (IValidator)validatorObj; // Safe path (works on any version FluentValidation)

                // guaranteed to work on any version FluentValidation
                ValidationResult result = await validator.ValidateAsync(new ValidationContext<object>(argument));

                // If there are errors, add them to the shared dictionary
                if (!result.IsValid)
                {
                    foreach (var failure in result.Errors)
                    {
                        // Key: PropertyName, value: list of messages for this property
                        if (!aggregatedErrors.TryGetValue(failure.PropertyName, out var list))
                        {
                            list = new List<string>();
                            aggregatedErrors[failure.PropertyName] = list;
                        }
                        list.Add(failure.ErrorMessage);
                    }
                }


                //var validateMethod = validatorType.GetMethod("ValidateAsync", new[] { argument.GetType(), typeof(CancellationToken) });
                //if (validateMethod != null)
                //{
                //    var task = (Task)validateMethod.Invoke(validator, new object[] { argument, CancellationToken.None })!;
                //    await task.ConfigureAwait(false);

                //    var resultProperty = task.GetType().GetProperty("Result");
                //    var validationResult = resultProperty?.GetValue(task);

                //    var isValidProp = validationResult?.GetType().GetProperty("IsValid")?.GetValue(validationResult);
                //    if (isValidProp is false)
                //    {
                //        var errors = (IEnumerable<FluentValidation.Results.ValidationFailure>)
                //            validationResult?.GetType().GetProperty("Errors")?.GetValue(validationResult)!;

                //        var errorDict = errors
                //            .GroupBy(e => e.PropertyName)
                //            .ToDictionary(
                //                g => g.Key,
                //                g => g.Select(e => e.ErrorMessage).ToArray()
                //            );

                //        context.Result = new BadRequestObjectResult(new
                //        {
                //            //type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                //            //title = "One or more validation errors occurred.",
                //            status = 400,
                //            isValid = false,
                //            errors = errorDict,
                //            //traceId = context.HttpContext.TraceIdentifier
                //        });

                //        return;
                //    }
                //}

            }
        }

        // Before: returned 400 right after the first invalid model.
        // Now: we checked ALL arguments and, if there are errors, return 400 with the full list.
        if (aggregatedErrors.Count > 0)
        {
            //  Build the same format as before : string -> string[]
            var errorDict = aggregatedErrors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray());

            // Return 400 as the same object (frontend = the same)
            context.Result = new BadRequestObjectResult(new
            {
                //type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                //title = "One or more validation errors occurred.",
                status = 400,
                isValid = false,
                errors = errorDict,
                //traceId = context.HttpContext.TraceIdentifier
            });

            return; // stop the pipeline
        }

        await next(); // If there are no errors, continue
    }
}

