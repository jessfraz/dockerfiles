FROM r.j3ss.co/powershell:latest

# Install/Update PowerShellGet
RUN pwsh -c "Install-Module PowerShellGet -Force"

# Install Azure PowerShell module
# Install the Azure Resource Manager modules from the PowerShell Gallery
RUN pwsh -c "Install-Module -Name AzureRM -AllowClobber -Force"

# You will have to load the module into the session with:
# 	Import-Module -Name AzureRM
ENTRYPOINT [ "pwsh" ]
