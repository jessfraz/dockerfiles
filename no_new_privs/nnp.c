#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(int argc, char *argv[]){
        printf("Effective uid: %d\n", geteuid());
        return 0;
}
