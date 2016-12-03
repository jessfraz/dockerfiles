# fontpatcher

How to use:

1. Enter the directory where the font file lives you wish to patch.
2. Run:

        $ docker run --rm -it \
            -v $(pwd):/workdir \
            --workdir /workdir \
            r.j3ss.co/fontpatcher myfontfile.otf

3. You should have a `myfontfile-Powerline.otf` as an artifact.
4. Copy the font file into ``~/.fonts`` (or another X font directory)::

        $ cp MyFontFile-Powerline.otf ~/.fonts

   **Note:** If the font is a pure bitmap font (e.g. a PCF font) it will be
   stored in the BDF format. This is usually not a problem, and you may
   convert the font back to the PCF format using ``bdftopcf`` if you want
   to. All other fonts will be stored in the OTF format regardless of the
   original format.

5. Update your font cache::

        $ sudo fc-cache -vf

   **Note:** If you use vim in rxvt-unicode in the client/daemon mode, you
   may need to close all running terminals as well for the font to be
   updated.
