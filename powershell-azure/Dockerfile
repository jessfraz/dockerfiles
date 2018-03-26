FROM r.j3ss.co/powershell:latest

# Install/Update PowerShellGet
RUN pwsh -c "Install-Module PowerShellGet -Force"

# Install Azure PowerShell module
# Install the Azure Resource Manager modules from the PowerShell Gallery
RUN pwsh -c "Install-Module -Name AzureRM -AllowClobber -Force"

ENTRYPOINT [ "pwsh" ]
